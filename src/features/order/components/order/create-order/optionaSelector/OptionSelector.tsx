"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Check, CornerDownLeft } from "lucide-react";

import { LocalOrderOptionGroup } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import {
  LocalOption,
  LocalProduct,
} from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { OptionGroupCard } from "./components/OptionGroupCard";
import { KitchenNote } from "./components/KitchenNote";


interface Props {
  product: LocalProduct;
  productQuantity?: number;
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
      })) ?? []
  );

  const [notes, setNotes] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    if (!product.optionGroups?.length) return [];
    const firstGroup = product.optionGroups[0];
    return firstGroup ? [firstGroup.id] : [];
  });

  const getGroupSelectedQuantity = useCallback(
    (groupId: string) => {
      const group = selections.find((item) => item.groupId === groupId);
      if (!group) return 0;
      return group.options.reduce((total, option) => total + option.quantity, 0);
    },
    [selections]
  );

  const getOptionQuantity = useCallback(
    (groupId: string, optionId: string) => {
      const group = selections.find((item) => item.groupId === groupId);
      if (!group) return 0;
      return group.options.find((item) => item.optionId === optionId)?.quantity ?? 0;
    },
    [selections]
  );

  const invalidGroups = useMemo(() => {
    if (!product.optionGroups?.length) return [];
    return product.optionGroups.filter((group) => {
      const selected = getGroupSelectedQuantity(group.id);
      const effectiveMin = (group.minQuantity || 0) * productQuantity;
      return selected < effectiveMin;
    });
  }, [product.optionGroups, productQuantity, getGroupSelectedQuantity]);

  const canConfirm = invalidGroups.length === 0;

  const missingSelectionsCount = useMemo(() => {
    return invalidGroups.reduce((total, group) => {
      const effectiveMin = (group.minQuantity || 0) * productQuantity;
      const selected = getGroupSelectedQuantity(group.id);
      return total + Math.max(0, effectiveMin - selected);
    }, 0);
  }, [invalidGroups, productQuantity, getGroupSelectedQuantity]);

  const updateOptionQuantity = useCallback(
    (
      groupId: string,
      option: LocalOption,
      delta: number,
      effectiveMax: number
    ) => {
      setSelections((current) =>
        current.map((group) => {
          if (group.groupId !== groupId) return group;

          const currentTotal = group.options.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const currentOpt = group.options.find(
            (item) => item.optionId === option.id
          );
          const currentOptQty = currentOpt?.quantity ?? 0;

          if (effectiveMax === 1 && delta > 0) {
            return {
              ...group,
              options: [
                {
                  optionId: option.id,
                  optionName: option.name,
                  priceFinal: Number(option.priceFinal || 0),
                  quantity: 1,
                },
              ],
            };
          }

          let newQty = Math.max(0, currentOptQty + delta);

          if (
            delta > 0 &&
            effectiveMax > 0 &&
            currentTotal - currentOptQty + newQty > effectiveMax
          ) {
            newQty = effectiveMax - (currentTotal - currentOptQty);
          }

          if (newQty === 0) {
            return {
              ...group,
              options: group.options.filter(
                (item) => item.optionId !== option.id
              ),
            };
          }

          if (!currentOpt) {
            return {
              ...group,
              options: [
                ...group.options,
                {
                  optionId: option.id,
                  optionName: option.name,
                  priceFinal: Number(option.priceFinal || 0),
                  quantity: newQty,
                },
              ],
            };
          }

          return {
            ...group,
            options: group.options.map((item) =>
              item.optionId === option.id ? { ...item, quantity: newQty } : item
            ),
          };
        })
      );
    },
    []
  );

  // Auto-expande el siguiente grupo inválido
  useEffect(() => {
    if (!product.optionGroups?.length) return;

    const nextInvalidGroup = product.optionGroups.find((group) => {
      const selected = getGroupSelectedQuantity(group.id);
      const effectiveMin = (group.minQuantity || 0) * productQuantity;
      return selected < effectiveMin;
    });

    if (!nextInvalidGroup) return;

    setExpandedGroups((current) => {
      if (current.includes(nextInvalidGroup.id)) return current;
      return [...current, nextInvalidGroup.id];
    });
  }, [selections, product.optionGroups, productQuantity, getGroupSelectedQuantity]);

  const handleAutoAdvance = useCallback(
    (groupId: string) => {
      if (!product.optionGroups?.length) return;

      const currentIndex = product.optionGroups.findIndex(
        (group) => group.id === groupId
      );
      if (currentIndex === -1) return;

      const nextGroup = product.optionGroups
        .slice(currentIndex + 1)
        .find((group) => {
          const selected = getGroupSelectedQuantity(group.id);
          const effectiveMin = (group.minQuantity || 0) * productQuantity;
          return effectiveMin > 0 && selected < effectiveMin;
        });

      if (!nextGroup) return;

      setExpandedGroups((current) => {
        const withoutCurrent = current.filter((id) => id !== groupId);
        return withoutCurrent.includes(nextGroup.id)
          ? withoutCurrent
          : [...withoutCurrent, nextGroup.id];
      });
    },
    [product.optionGroups, productQuantity, getGroupSelectedQuantity]
  );

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId]
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;

    const finalSelections = selections
      .filter((group) => group.options.length > 0)
      .map((group) => ({
        groupId: group.groupId,
        groupName: group.groupName,
        options: group.options,
      })) as LocalOrderOptionGroup[];

    onConfirm(finalSelections, notes.trim());
  }, [canConfirm, selections, notes, onConfirm]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Enter") {
        if (
          document.activeElement?.tagName === "INPUT" &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          return;
        }

        if (canConfirm) {
          event.preventDefault();
          handleConfirm();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canConfirm, handleConfirm, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/70 backdrop-blur-xs p-0 select-none md:items-center md:p-4">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl md:max-w-xl md:rounded-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2.5 text-white">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-black uppercase tracking-tight">
                {product.name}
              </h3>
              {productQuantity > 1 && (
                <span className="shrink-0 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                  {productQuantity} UN.
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[9px] font-medium text-slate-300">
              <span>
                <kbd className="rounded bg-slate-700 px-1 font-mono">Enter</kbd>{" "}
                confirmar
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <kbd className="rounded bg-slate-700 px-1 font-mono">Esc</kbd>{" "}
                cancelar
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lista de Grupos */}
        <div className="flex-1 space-y-2.5 overflow-y-auto bg-slate-100/60 p-3">
          {product.optionGroups?.map((group) => {
            const groupSelections =
              selections.find((s) => s.groupId === group.id)?.options ?? [];

            return (
              <OptionGroupCard
                key={group.id}
                group={group}
                productQuantity={productQuantity}
                isExpanded={expandedGroups.includes(group.id)}
                selectedOptions={groupSelections}
                getOptionQuantity={getOptionQuantity}
                onToggleExpand={toggleGroup}
                onUpdateQuantity={updateOptionQuantity}
                onAutoAdvance={handleAutoAdvance}
              />
            );
          })}

          <KitchenNote notes={notes} onChangeNotes={setNotes} />
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white p-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-bold uppercase text-slate-500 transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {canConfirm ? (
              <>
                <Check size={14} strokeWidth={3} />
                <span>Agregar al pedido</span>
                <CornerDownLeft size={14} className="opacity-80" />
              </>
            ) : (
              <span>
                Faltan {missingSelectionsCount} selecci
                {missingSelectionsCount === 1 ? "ón" : "ones"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}