"use client";
import { useMemo, useState } from "react";
import {
  Save,
  CreditCard,
  Tag,
  PackageCheck,
  Layers,
  Plus,
} from "lucide-react";
import {
  IMenuProduct,
  IOption,
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
import {
  useCreateOption,
  useCreateOptionGroup,
  useDeleteManyOption,
  useDeleteMenuProduct,
  useDeleteOption,
  useDeleteOptionGroup,
  useUpdateMenuProduct,
  useUpdateOption,
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
import NewMenuGroup from "./components/news/NewMenuGroup";
import ProductOptions from "./components/group/ProductOptions";
import {
  AvailableMenuProduct,
  CreateOptionData,
  CreateOptionGroupData,
} from "../../types/product-options";

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

  const menus = useMenuStore((state) => state.menus);

  const product = useMenuStore((state) =>
    state.menus
      .find((m) => m.id === menuId)
      ?.sections.find((s) => s.id === sectionId)
      ?.products.find((p) => p.id === productId),
  );

  const menuProducts = useMemo(() => {
    const menu = menus.find((m) => m.id === menuId);

    if (!menu) {
      return [];
    }

    const products = menu.sections.flatMap((section) => section.products);

    return products.map((product) => ({
      id: product.id,

      name: product.name,

      imageUrl: product.imageUrl,

      finalPrice: String(product.finalPrice),

      available: product.available,
    }));
  }, [menus, menuId]);

  const groups = useMemo(() => {
    if (!product) return [];
    return product.optionGroups || [];
  }, [product]);

  const [initialProduct] = useState(() => (product ? { ...product } : null));
  const updateProduct = useMenuStore((state) => state.updateProduct);
  const deleteProductStore = useMenuStore((state) => state.deleteProduct);
  const updateGroupStore = useMenuStore((state) => state.updateGroup);
  const deleteGroupStore = useMenuStore((state) => state.deleteGroup);
  const addGroupStore = useMenuStore((state) => state.addGroup);
  const replaceTempId = useMenuStore((state) => state.replaceTempId);
  const restoreGroup = useMenuStore((state) => state.restoreGroup);

  const deleteProduct = useDeleteMenuProduct(businessId);

  const createGroup = useCreateOptionGroup(businessId);
  const updateGroup = useUpdateOptionGroup(businessId);
  const deleteGroup = useDeleteOptionGroup(businessId);
  const deleteManyOptionsMutate = useDeleteManyOption(businessId);
  const updateMenuProductMutate = useUpdateMenuProduct(businessId);

  const createOption = useCreateOption(businessId);
  const updateOption = useUpdateOption(businessId);
  const deleteOption = useDeleteOption(businessId);

  const createOptionStore = useMenuStore((state) => state.addOption);
  const updateOptionStore = useMenuStore((state) => state.updateOption);
  const deleteOptionStore = useMenuStore((state) => state.deleteOption);
  const restoreOption = useMenuStore((state) => state.restoreOption);

  if (!product) return null;

  const handleUpdate = (data: Partial<IMenuProduct>) => {
    updateProduct({ menuId, sectionId, productId }, { ...product, ...data });
  };

  const handleDeleteProduct = async () => {
    deleteProduct.mutate(product.id);
    deleteProductStore({
      menuId,
      sectionId,
      productId,
    });
    onClose();
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
    updatedData: Partial<OptionGroupCreate>,
  ) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const previousValues = getPreviousValues<IOptionGroup>(
      group,
      updatedData as Partial<IOptionGroup>,
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
        previousValues,
      );
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  };

  const deleteGroupWithOptions = async (groupId: string) => {
    const groupToDelete = product.optionGroups.find((g) => g.id === groupId);
    if (!groupToDelete) return;

    const optionIds = groupToDelete.options.map((option) => option.id);

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

  const handleNewGroupCreate = async (group: CreateOptionGroupData) => {
    const tempId = generateTempId();

    // Preservamos el quantityType original del formulario,
    // o derivamos FIXED si min y max son iguales y mayores a 0.
    const isFixed = (group.minQuantity === group.maxQuantity && group.minQuantity > 0);
    const finalQuantityType = isFixed ? "FIXED" : "MIN_MAX";

    // Usamos Nullish Coalescing (??) para no sobreescribir el 0
    const finalMinQuantity = group.minQuantity ?? 0;
    const finalMaxQuantity = group.maxQuantity ?? 1;

    const optimisticGroup: IOptionGroup = {
      id: tempId,
      name: group.name,
      minQuantity: finalMinQuantity,
      maxQuantity: finalMaxQuantity,
      options: [],
      quantityType: finalQuantityType,
    };

    addGroupStore({ menuId, productId, sectionId }, optimisticGroup);
    setShowNewGroup(false);

    try {
      const result = await createGroup.mutateAsync({
        name: group.name,
        minQuantity: finalMinQuantity,
        maxQuantity: finalMaxQuantity,
        menuProductId: product.id,
        quantityType: finalQuantityType,
      });

      if (result) {
        replaceTempId(
          "group",
          { menuId, sectionId, productId },
          tempId,
          result.id,
        );
        updateGroupStore(
          { menuId, sectionId, productId, groupId: result.id },
          result,
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

  // Actualizar opción
  const handleOptionUpdate = async (updatedData: Partial<IOption>) => {
    // 1. 🔍 Encontrar la opción actual
    const currentOption = groups
      .flatMap((g) => g.options)
      .find((o) => o.id === updatedData.id);

    if (!currentOption) return;

    // 2. 💾 GUARDAR ESTADO DE ROLLBACK
    const previousValues = getPreviousValues<IOption>(
      currentOption,
      updatedData,
    );

    // 3. ⚡ APLICAR ACTUALIZACIÓN OPTIMISTA
    updateOptionStore(
      {
        menuId,
        groupId: currentOption.optionGroupId,
        optionId: currentOption.id,
        productId,
        sectionId,
      },
      updatedData,
    );
    try {
      const result = await updateOption.mutateAsync({
        data: updatedData,
        optionId: updatedData.id || "",
      });
      if (result) {
        // 4. ✅ ÉXITO: Aplicar el resultado canónico del backend
        updateOptionStore(
          {
            menuId,
            groupId: currentOption.optionGroupId,
            optionId: result.id,
            productId,
            sectionId,
          },
          result,
        );
        addAlert({
          message: `Opción "${result.name}" actualizada.`,
          type: "success",
        });
      } else {
        throw new Error("La API no devolvió la opción actualizada.");
      }
    } catch (e) {
      updateOptionStore(
        {
          menuId,
          groupId: currentOption.optionGroupId,
          optionId: currentOption.id,
          productId,
          sectionId,
        },
        previousValues,
      );
      addAlert({
        message: getDisplayErrorMessage(e),
        type: "error",
      });
    }
  };

  // Eliminar opción
  const handleOptionDelete = async (optionId: string) => {
    const optionToDelete = groups
      .flatMap((g) => g.options)
      .find((o) => o.id === optionId);

    if (!optionToDelete) return;

    // 1. 💾 GUARDAR ESTADO DE ROLLBACK: COPIA PROFUNDA
    const optionToRestore = deepCopy(optionToDelete);

    // 2. ⚡ APLICAR ELIMINACIÓN OPTIMISTA
    deleteOptionStore({
      menuId,
      groupId: optionToDelete.optionGroupId,
      optionId: optionToDelete.id,
      productId,
      sectionId,
    });
    try {
      await deleteOption.mutateAsync(optionId);
      addAlert({
        message: `Opción "${optionToRestore.name}" eliminada con éxito.`,
        type: "info",
      });
    } catch (e) {
      restoreOption(
        { menuId, groupId: optionToDelete.optionGroupId, productId, sectionId },
        optionToRestore,
      );
      addAlert({
        message: getDisplayErrorMessage(e),
        type: "error",
      });
    }
  };

  // Crear nueva opción
  const handleNewOptionCreate = async (
    groupId: string,
    options: CreateOptionData[],
  ) => {
    const tempId = generateTempId();

    const optionsCreate: IOption[] = options.map((option) => ({
      id: tempId,
      hasStock: option.hasStock,
      index: 0,
      name: option.name,
      priceFinal: option.priceFinal,
      priceModifierType: "0",
      priceWithoutTaxes: "0",
      taxesAmount: "0",
      maxQuantity: 1,
      images: [],
      optionGroupId: groupId,
    }));

    if (!optionsCreate.length) return;

    // 3. 💾 ACTUALIZACIÓN OPTIMISTA
    createOptionStore(
      { groupId, menuId, productId, sectionId },
      optionsCreate[0],
    );

    optionsCreate.forEach(async (optionCreate) => {
      try {
        const { id, images, ...rest } = optionCreate;
        const result = await createOption.mutateAsync(rest);
        if (result && result.id) {
          // 5. ✅ ÉXITO: REEMPLAZAR ID TEMPORAL
          replaceTempId(
            "option",
            { menuId, sectionId, productId, groupId }, // IDs de los padres
            tempId,
            result.id, // ID real
          );

          // 6. Aplicar el patch canónico (opcional pero recomendado)
          updateOptionStore(
            { menuId, sectionId, productId, groupId, optionId: result.id },
            result,
          );

          addAlert({
            message: `Opción "${result.name}" creada con éxito.`,
            type: "success",
          });
        } else {
          throw new Error("La opción se creó pero no se recibió el ID real.");
        }
      } catch (e) {
        deleteOptionStore({
          menuId,
          groupId,
          optionId: tempId,
          productId,
          sectionId,
        });
        addAlert({
          message: getDisplayErrorMessage(e),
          type: "error",
        });
      }
    });
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
          cost={product.cost}
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
      {/* BLOQUE 5: GRUPOS DE OPCIONES */}

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm border-b border-slate-100 pb-3">
          <Layers className="w-4 h-4 text-amber-600" />

          <h3>Grupos de Opciones y Adicionales</h3>
        </div>

        <ProductOptions
          productId={productId}
          groups={groups}
          menuProducts={menuProducts}
          onCreateGroup={handleNewGroupCreate}
          onUpdateGroup={handleGroupUpdate}
          onDeleteGroup={deleteGroupWithOptions}
          onCreateOptions={handleNewOptionCreate}
          onDeleteOption={handleOptionDelete}
        />
      </section>

      {/* BOTONES ACCIÓN (Renderizados abajo) */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-3">
        <button
          type="button"
          onClick={handleDeleteProduct}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          Eliminar
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
