"use client";
import React, { useState } from "react";
import { Plus, Save, Layers, CreditCard, Tag, PackageCheck } from "lucide-react";
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
          message: `Producto actualizado correctamente`,
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
    if (!group) return;

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

    deleteGroupStore({ groupId, menuId, productId, sectionId });
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
        replaceTempId(
          "group",
          { menuId, sectionId, productId },
          tempId,
          result.id
        );
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
      deleteGroupStore({ groupId: tempId, menuId, productId, sectionId });
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* BLOQUE 1: IMAGEN E INFORMACIÓN BÁSICA */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
        <MenuProductImage
          businessId={businessId}
          menuProductId={product.id}
          image={product.imageUrl || ""}
          name={product.name}
          onUpdate={(data) => handleUpdate({ imageUrl: data.imageUrl })}
        />

        <MenuProductHeader
          name={product.name}
          description={product.description}
          onUpdate={(data) => handleUpdate(data)}
        />
      </section>

      {/* BLOQUE 2: PRECIO Y ETIQUETAS */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-3">
          <Tag className="w-4 h-4 text-blue-600" />
          <h3>Precio y Promociones</h3>
        </div>

        <MenuProductPrice
          finalPrice={product.finalPrice}
          originalPrice={product.originalPrice}
          discountPercentage={product.discountPercentage}
          currencyMask={product.currencyMask}
          onUpdate={(data) => handleUpdate(data)}
        />

        <div className="pt-2">
          <MenuProductFlags
            isMostOrdered={product.isMostOrdered}
            isRecommended={product.isRecommended}
            onUpdate={(data) => handleUpdate(data)}
          />
        </div>
      </section>

      {/* BLOQUE 3: DISPONIBILIDAD Y STOCK */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-3">
          <PackageCheck className="w-4 h-4 text-emerald-600" />
          <h3>Disponibilidad y Visibilidad</h3>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <EnabledSwitch
            enabled={!!product.enabled}
            onChange={(val) => handleUpdate({ enabled: val })}
            label="Visible en la carta"
            hint="Si está desactivado, el producto estará oculto para todos los clientes."
          />
        </div>

        <MenuProductStock
          available={product.available}
          stock={product.stock}
          preparationTime={product.preparationTime}
          onUpdate={(data) => handleUpdate(data)}
        />
      </section>

      {/* BLOQUE 4: MÉTODOS DE PAGO */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-3">
          <CreditCard className="w-4 h-4 text-purple-600" />
          <h3>Métodos de pago aceptados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
            <EnabledSwitch
              enabled={product.acceptsCash ?? true}
              onChange={(val) => handleUpdate({ acceptsCash: val })}
              label="Efectivo"
              hint="Pago presencial al entregar."
            />
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
            <EnabledSwitch
              enabled={product.acceptsTransfer ?? true}
              onChange={(val) => handleUpdate({ acceptsTransfer: val })}
              label="Transferencia"
              hint="Transferencia bancaria/CBU."
            />
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
            <EnabledSwitch
              enabled={product.acceptsQr ?? false}
              onChange={(val) => handleUpdate({ acceptsQr: val })}
              label="QR / Billetera"
              hint="MercadoPago o apps digitales."
            />
          </div>
        </div>
      </section>

      {/* BLOQUE 5: GRUPOS DE OPCIONES / ADICIONALES */}
      {/* <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Layers className="w-4 h-4 text-amber-600" />
            <h3>Grupos de Opciones y Adicionales</h3>
          </div>
          {!showNewGroup && (
            <button
              type="button"
              onClick={() => setShowNewGroup(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo grupo
            </button>
          )}
        </div>

        <div className="space-y-4 pt-1">
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

          {showNewGroup && (
            <NewMenuGroup
              menuProductId={product.id}
              onCreate={handleNewGroupCreate}
              onClose={() => setShowNewGroup(false)}
            />
          )}

          {!showNewGroup && (product.optionGroups ?? []).length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500 font-medium">
                Este producto no tiene adicionales ni opciones personalizables.
              </p>
            </div>
          )}
        </div>
      </section> */}

      {/* BOTONES ACCIÓN (Renderizados abajo) */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 shadow-sm shadow-blue-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}