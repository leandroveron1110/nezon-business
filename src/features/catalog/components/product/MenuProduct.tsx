"use client";
import React, { useState } from "react";
import {
  IMenuProduct,
  IOptionGroup,
  OptionGroupCreate,
} from "../../types/catlog";
import MenuProductImage from "./components/ImageProdct/MenuProducImage";
import MenuGroup from "./components/MenuGroup";
import MenuProductHeader from "./components/MenuProductHeader";
import MenuProductPrice from "./components/MenuProductPrice";
import MenuProductStock from "./components/MenuProductStock";
import MenuProductFlags from "./components/MenuProductFlags";
import EnabledSwitch from "./components/EnabledSwitch";
import NewMenuGroup from "./components/news/NewMenuGroup";
import {
  useCreateOptionGroup,
  useDeleteManyOption,
  useDeleteOptionGroup,
  useUpdateMenuProduct,
  useUpdateOptionGroup,
} from "../../hooks/useMenuHooks";
import { useMenuStore } from "../../stores/menuStore";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";
import {
  deepCopy,
  generateTempId,
  getPreviousValues,
} from "@/features/common/utils/utilities-rollback";

interface Props {
  businessId: string;
  menuId: string;
  sectionId: string;
  productId: string;
  onClose: () => void;
}

export default function MenuProduct({
  businessId,
  menuId,
  sectionId,
  productId,
  onClose,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const { addAlert } = useAlert();

  // 📌 producto desde la store
  const product = useMenuStore((state) =>
    state.menus
      .find((m) => m.id === menuId)
      ?.sections.find((s) => s.id === sectionId)
      ?.products.find((p) => p.id === productId)
  );

  const [initialProduct] = useState(() => (product ? { ...product } : null));
  const updateProduct = useMenuStore((state) => state.updateProduct);
  const updateGroupStore = useMenuStore((state) => state.updateGroup);
  const deleteGroupStore = useMenuStore((state) => state.deleteGroup);
  const addGroupStore = useMenuStore((state) => state.addGroup);
  const replaceTempId = useMenuStore((state) => state.replaceTempId);
  const restoreGroup = useMenuStore((state) => state.restoreGroup);

  const createGroup = useCreateOptionGroup(businessId);
  const updateGroup = useUpdateOptionGroup(businessId);
  const deleteGroup = useDeleteOptionGroup(businessId);
  const deleteManyOptionsMutate = useDeleteManyOption(businessId);
  const updateMenuProductMutate = useUpdateMenuProduct(businessId);

  if (!product) return null;

  const handleUpdate = (data: Partial<IMenuProduct>) => {
    updateProduct({ menuId, sectionId, productId }, { ...product, ...data });
  };

  const getModifiedFields = (): Partial<IMenuProduct> => {
    if (!initialProduct) return {};

    const modified: Record<string, unknown> = { id: product.id };

    (Object.keys(product) as (keyof IMenuProduct)[]).forEach((key) => {
      if (
        JSON.stringify(product[key]) !== JSON.stringify(initialProduct[key])
      ) {
        const value = product[key];
        if (value !== null) {
          modified[key as string] = value;
        }
      }
    });

    return modified as Partial<IMenuProduct>;
  };

  const handleSaveAll = async () => {
    if (!initialProduct) return;
    const modified = getModifiedFields();

    if (Object.keys(modified).length <= 1) {
      onClose();
      return;
    }

    const previousValues = getPreviousValues(initialProduct, modified);
    setSaving(true);
    updateProduct({ menuId, sectionId, productId }, modified);
    onClose();
    try {
      const data = await updateMenuProductMutate.mutateAsync({
        productId,
        data: modified,
      });

      if (data) {
        updateProduct({ menuId, sectionId, productId }, data);
        addAlert({
          message: `Producto actualizado`,
          type: "info",
        });
      } else {
        throw new Error(`Error al actualizar el producto`);
      }
    } catch (error) {
      updateProduct({ menuId, sectionId, productId }, previousValues);

      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGroupUpdate = async (
    groupId: string,
    updatedData: Partial<OptionGroupCreate>
  ) => {
    const group = product.optionGroups.find((g) => g.id === groupId);

    if (!group) {
      return;
    }

    const previousValues = getPreviousValues<IOptionGroup>(
      group,
      updatedData as Partial<IOptionGroup>
    );

    updateGroupStore({ menuId, groupId, sectionId, productId }, updatedData);

    try {
      const result = await updateGroup.mutateAsync({
        groupId,
        data: updatedData,
      });
      if (result) {
        updateGroupStore({ menuId, groupId, sectionId, productId }, result);
        addAlert({
          message: `Grupo "${result.name}" actualizado.`,
          type: "success",
        });
      } else {
        throw new Error(`La API no devolvió el grupo actualizado.`);
      }
    } catch (error) {
      updateGroupStore(
        { menuId, groupId, sectionId, productId },
        previousValues
      );
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  };

  const deleteGroupWithOptions = async (
    groupId: string,
    optionIds: string[]
  ) => {
    const groupToDelete = product.optionGroups.find((g) => g.id === groupId);

    if (!groupToDelete) return;

    const groupToRestore = deepCopy(groupToDelete);

    // 2. ⚡ APLICAR ELIMINACIÓN OPTIMISTA
    deleteGroupStore({
      groupId,
      menuId,
      productId,
      sectionId,
    });
    try {
      await deleteManyOptionsMutate.mutateAsync(optionIds);
      await deleteGroup.mutateAsync(groupId);
      addAlert({
        message: `Grupo de opciones "${groupToRestore.name}" eliminado con éxito.`,
        type: "info",
      });
    } catch (error) {
      restoreGroup({ menuId, sectionId, productId }, groupToRestore);
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  };

  const handleNewGroupCreate = async (group: OptionGroupCreate) => {
    const tempId = generateTempId();
    const optimisticGroup: IOptionGroup = {
      id: tempId,
      name: group.name,
      maxQuantity: group.maxQuantity || 1,
      minQuantity: group.minQuantity || 1,
      options: group.options || [],
      quantityType: group.quantityType,
    };

    addGroupStore({ menuId, productId, sectionId }, optimisticGroup);
    setShowNewGroup(false);
    try {
      const result = await createGroup.mutateAsync(group);

      if (result) {
        // 5. ✅ ÉXITO: REEMPLAZAR ID TEMPORAL
        replaceTempId(
          "group",
          { menuId, sectionId, productId }, // IDs de los padres
          tempId,
          result.id // ID real
        );

        // 6. Aplicar el patch canónico (opcional pero recomendado)
        updateGroupStore(
          { menuId, sectionId, productId, groupId: result.id },
          result
        );
        addAlert({
          message: `Grupo "${result.name}" creado con éxito.`,
          type: "success",
        });
      } else {
        throw new Error("El grupo se creó pero no se recibió el ID real.");
      }
    } catch (error) {
      deleteGroupStore({
        groupId: tempId,
        menuId,
        productId,
        sectionId,
      });
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Imagen */}
      <MenuProductImage
        businessId={businessId}
        menuProductId={product.id}
        image={product.imageUrl || ""}
        name={product.name}
        onUpdate={(data) => handleUpdate({ imageUrl: data.imageUrl })}
      />

      {/* Header */}
      <MenuProductHeader
        name={product.name}
        description={product.description}
        onUpdate={(data) => handleUpdate(data)}
      />

      {/* Precio */}
      <MenuProductPrice
        finalPrice={product.finalPrice}
        originalPrice={product.originalPrice}
        discountPercentage={product.discountPercentage}
        currencyMask={product.currencyMask}
        onUpdate={(data) => handleUpdate(data)}
      />

      {/* Stock y disponibilidad */}
      <MenuProductStock
        available={product.available}
        stock={product.stock}
        preparationTime={product.preparationTime}
        onUpdate={(data) => handleUpdate(data)}
      />

      {/* Flags */}
      <MenuProductFlags
        isMostOrdered={product.isMostOrdered}
        isRecommended={product.isRecommended}
        onUpdate={(data) => handleUpdate(data)}
      />

      {/* Enabled */}
      <EnabledSwitch
        enabled={!!product.enabled}
        onChange={(val) => handleUpdate({ enabled: val })}
        label="Visible en la carta"
        hint="Activa o desactiva la visibilidad del producto."
      />

      {/* -------------------------------
          Nueva sección: Métodos de pago (producto)
          ------------------------------- */}
      <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white">
        <h4 className="font-semibold text-gray-800 mb-3">Métodos de pago (producto)</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <EnabledSwitch
            enabled={product.acceptsCash ?? true}
            onChange={(val) => handleUpdate({ acceptsCash: val })}
            label="Acepta efectivo"
            hint="Si está activo, el cliente puede pagar este producto en efectivo."
          />

          <EnabledSwitch
            enabled={product.acceptsTransfer ?? true}
            onChange={(val) => handleUpdate({ acceptsTransfer: val })}
            label="Acepta transferencia"
            hint="Si está activo, el cliente puede pagar este producto por transferencia."
          />

          <EnabledSwitch
            enabled={product.acceptsQr ?? false}
            onChange={(val) => handleUpdate({ acceptsQr: val })}
            label="Acepta QR / billetera"
            hint="Si está activo, el cliente puede pagar con QR o billeteras digitales."
          />
        </div>
      </div>

      {/* Opciones */}
      <div className="space-y-6 mb-6">
        {(product.optionGroups ?? []).map((group) => (
          <MenuGroup
            key={group.id}
            businessId={businessId}
            groupId={group.id}
            menuId={menuId}
            productId={productId}
            sectionId={sectionId}
            currencyMask={product.currencyMask || "$"}
            onDeleteGroup={deleteGroupWithOptions}
            onUpdate={(data) => handleGroupUpdate(group.id, data.group)}
          />
        ))}

        {/* {showNewGroup ? (
          <NewMenuGroup
            menuProductId={product.id}
            onCreate={handleNewGroupCreate}
            onClose={() => setShowNewGroup(false)}
          />
        ) : (
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setShowNewGroup(true)}
          >
            + Agregar grupo
          </button>
        )} */}
      </div>

      <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={onClose}
          className="flex-1 text-sm sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
