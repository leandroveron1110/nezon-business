"use client";

import { useState } from "react";
import {
  FileText,
  Minus,
  Plus,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

import { LocalOrderOptionGroup } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import {
  LocalOption,
  LocalProduct,
} from "@/mini-back/infrastructure/dexie/shcema/products.schema";

interface Props {
  product: LocalProduct;
  productQuantity?: number; // Cantidad del ítem principal (ej: 3 empanadas o 1 pack)
  onConfirm: (selected: LocalOrderOptionGroup[], notes: string) => void;
  onClose: () => void;
}

interface SelectionGroup {
  groupId: string;
  groupName: string;
  options: {
    optionId: string;
    optionName: string;
    priceFinal: number;
    quantity: number;
  }[];
}

export function OptionSelector({
  product,
  productQuantity = 1,
  onConfirm,
  onClose,
}: Props) {
  const [selections, setSelections] = useState<SelectionGroup[]>(
    () =>
      product.optionGroups?.map((group) => ({
        groupId: group.id,
        groupName: group.name,
        options: [],
      })) ?? [],
  );

  const [notes, setNotes] = useState("");

  // Obtiene el total de opciones elegidas dentro de un grupo
  const getGroupSelectedQuantity = (groupId: string) => {
    const group = selections.find((item) => item.groupId === groupId);
    if (!group) return 0;
    return group.options.reduce((total, option) => total + option.quantity, 0);
  };

  const getOptionQuantity = (groupId: string, optionId: string) => {
    const group = selections.find((item) => item.groupId === groupId);
    if (!group) return 0;
    const option = group.options.find((item) => item.optionId === optionId);
    return option?.quantity ?? 0;
  };

  const increaseOption = (
    groupId: string,
    option: LocalOption,
    effectiveMaxGroupQty: number,
  ) => {
    setSelections((current) =>
      current.map((group) => {
        if (group.groupId !== groupId) return group;

        const totalSelected = group.options.reduce(
          (total, item) => total + item.quantity,
          0,
        );

        // Si ya se alcanzó el límite máximo efectivo del grupo, no permite sumar más
        if (effectiveMaxGroupQty > 0 && totalSelected >= effectiveMaxGroupQty) {
          return group;
        }

        const existingOption = group.options.find(
          (item) => item.optionId === option.id,
        );

        if (!existingOption) {
          return {
            ...group,
            options: [
              ...group.options,
              {
                optionId: option.id,
                optionName: option.name,
                priceFinal: Number(option.priceFinal || 0),
                quantity: 1,
              },
            ],
          };
        }

        return {
          ...group,
          options: group.options.map((item) =>
            item.optionId === option.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }),
    );
  };

  const decreaseOption = (groupId: string, optionId: string) => {
    setSelections((current) =>
      current.map((group) => {
        if (group.groupId !== groupId) return group;

        const existingOption = group.options.find(
          (item) => item.optionId === optionId,
        );

        if (!existingOption) return group;

        if (existingOption.quantity <= 1) {
          return {
            ...group,
            options: group.options.filter((item) => item.optionId !== optionId),
          };
        }

        return {
          ...group,
          options: group.options.map((item) =>
            item.optionId === optionId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        };
      }),
    );
  };

  // Verifica si hay grupos sin cumplir el requerimiento mínimo dinámico
  const getInvalidGroups = () => {
    if (!product.optionGroups?.length) return [];
    return product.optionGroups.filter((group) => {
      const selectedQuantity = getGroupSelectedQuantity(group.id);
      const effectiveMin = (group.minQuantity || 0) * productQuantity;
      return selectedQuantity < effectiveMin;
    });
  };

  const invalidGroups = getInvalidGroups();
  const canConfirm = invalidGroups.length === 0;

  const handleConfirm = () => {
    if (!canConfirm) return;

    const finalSelections = selections
      .filter((group) => group.options.length > 0)
      .map((group) => ({
        groupId: group.groupId,
        groupName: group.groupName,
        options: group.options,
      })) as LocalOrderOptionGroup[];

    onConfirm(finalSelections, notes.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm md:items-center">
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all md:max-w-md md:rounded-2xl border border-slate-100">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
              Personalizar Ítem{" "}
              {productQuantity > 1 && `(${productQuantity} un.)`}
            </span>
            <h3 className="text-base font-black text-slate-800 leading-tight">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {product.optionGroups?.map((group) => {
            const selectedQuantity = getGroupSelectedQuantity(group.id);

            // Mínimo y Máximo escalados por la cantidad total requerida
            const effectiveMin = (group.minQuantity || 0) * productQuantity;
            const effectiveMax = (group.maxQuantity || 0) * productQuantity;

            const isInvalid = selectedQuantity < effectiveMin;
            const reachedGroupLimit =
              effectiveMax > 0 && selectedQuantity >= effectiveMax;

            return (
              <div
                key={group.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isInvalid
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-slate-200/80 bg-slate-50/40"
                }`}
              >
                {/* HEADER DEL GRUPO */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          {group.name}
                        </h4>
                        {effectiveMin > 0 ? (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                            Requerido ({effectiveMin})
                          </span>
                        ) : (
                          <span className="rounded bg-slate-200/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                            Opcional
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {effectiveMax > 0
                          ? effectiveMin === effectiveMax
                            ? `Elegí exactamente ${effectiveMax}`
                            : `Elegí de ${effectiveMin} a ${effectiveMax}`
                          : `Elegí al menos ${effectiveMin}`}
                      </p>
                    </div>

                    <div
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black tracking-tight transition ${
                        isInvalid
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {selectedQuantity}{" "}
                      {effectiveMax > 0 ? `/ ${effectiveMax}` : "seleccionadas"}
                    </div>
                  </div>

                  {isInvalid && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                      <AlertCircle size={13} />
                      <span>
                        Faltan {effectiveMin - selectedQuantity} opción(es) por
                        seleccionar
                      </span>
                    </div>
                  )}
                </div>

                {/* OPCIONES */}
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const quantity = getOptionQuantity(group.id, option.id);
                    const canIncrease = option.hasStock && !reachedGroupLimit;

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                          quantity > 0
                            ? "border-emerald-500/80 bg-emerald-50/60 shadow-sm"
                            : "border-slate-200/60 bg-white"
                        } ${!option.hasStock ? "opacity-50" : ""}`}
                      >
                        {/* DETALLE OPCIÓN */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {option.name}
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            {Number(option.priceFinal) > 0
                              ? `+ $${Number(option.priceFinal).toLocaleString()}`
                              : "Sin cargo"}
                          </p>
                          {!option.hasStock && (
                            <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wide text-red-500">
                              Sin Stock
                            </p>
                          )}
                        </div>

                        {/* CONTROLES DE CANTIDAD */}
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            disabled={quantity === 0}
                            onClick={() => decreaseOption(group.id, option.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-5 text-center text-xs font-black text-slate-800">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            disabled={!canIncrease}
                            onClick={() =>
                              increaseOption(group.id, option, effectiveMax)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition active:scale-95 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-25"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* NOTA ADICIONAL */}
          <div className="pt-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-slate-600">
              <FileText size={14} />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Notas para la cocina
              </h4>
            </div>
            <textarea
              rows={2}
              placeholder="Ej: Sin aderezo, bien cocido, salsa aparte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-slate-50/80 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-extrabold uppercase tracking-wider text-slate-600 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-emerald-500 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {canConfirm ? (
              <>
                <CheckCircle2 size={15} />
                <span>Agregar</span>
              </>
            ) : (
              <span>Falta selección</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
