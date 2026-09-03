"use client";

import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { LocalOptionGroup } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { LocalOption } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { OptionRow } from "./OptionRow";

interface SelectedOption {
  optionId: string;
  optionName: string;
  priceFinal: number;
  quantity: number;
}

interface OptionGroupCardProps {
  group: LocalOptionGroup;
  productQuantity: number;
  isExpanded: boolean;
  selectedOptions: SelectedOption[];
  getOptionQuantity: (groupId: string, optionId: string) => number;
  onToggleExpand: (groupId: string) => void;
  onUpdateQuantity: (
    groupId: string,
    option: LocalOption,
    delta: number,
    effectiveMax: number
  ) => void;
  onAutoAdvance: (groupId: string) => void;
}

export function OptionGroupCard({
  group,
  productQuantity,
  isExpanded,
  selectedOptions,
  getOptionQuantity,
  onToggleExpand,
  onUpdateQuantity,
  onAutoAdvance,
}: OptionGroupCardProps) {
  const selectedQty = selectedOptions.reduce((acc, opt) => acc + opt.quantity, 0);
  const effectiveMin = (group.minQuantity || 0) * productQuantity;
  const effectiveMax = (group.maxQuantity || 0) * productQuantity;
  const isSingleChoice = effectiveMax === 1;

  const isInvalid = effectiveMin > 0 && selectedQty < effectiveMin;
  const isCompleted =
    !isInvalid &&
    (selectedQty >= effectiveMin || (effectiveMin === 0 && selectedQty > 0));
  const hasSelection = selectedQty > 0;

  const selectionSummary =
    selectedOptions.length === 0
      ? null
      : selectedOptions
          .map((opt) =>
            opt.quantity > 1 ? `${opt.optionName} ×${opt.quantity}` : opt.optionName
          )
          .join(", ");

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white shadow-2xs transition-all ${
        isInvalid
          ? "border-amber-300"
          : isCompleted
          ? "border-emerald-300/80"
          : "border-slate-200"
      }`}
    >
      {/* Header del Grupo */}
      <button
        type="button"
        onClick={() => onToggleExpand(group.id)}
        className={`flex w-full items-center justify-between gap-2 p-2.5 text-left transition-colors ${
          isExpanded
            ? "bg-white"
            : isCompleted
            ? "bg-emerald-50/40 hover:bg-emerald-50"
            : "bg-white hover:bg-slate-50"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              isInvalid
                ? "border-amber-400 bg-amber-100 text-amber-700"
                : isCompleted
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-300 bg-white text-slate-400"
            }`}
          >
            {isCompleted ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              <span className="text-[9px] font-black">{selectedQty}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[11px] font-black uppercase text-slate-800">
                {group.name}
              </span>
              <span
                className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-bold uppercase ${
                  effectiveMin > 0
                    ? isInvalid
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {effectiveMin > 0 ? "Obligatorio" : "Opcional"}
              </span>
            </div>

            {!isExpanded && selectionSummary && (
              <p className="mt-0.5 truncate text-[9.5px] font-bold text-emerald-700">
                {selectionSummary}
              </p>
            )}

            {!isExpanded && !hasSelection && effectiveMin > 0 && (
              <p className="mt-0.5 text-[9px] font-bold text-amber-700">
                Falta seleccionar {Math.max(0, effectiveMin - selectedQty)}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
              isInvalid
                ? "bg-amber-100 text-amber-800"
                : isCompleted
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {selectedQty}
            {effectiveMax > 0 ? ` / ${effectiveMax}` : ""}
          </span>

          {isExpanded ? (
            <ChevronDown size={15} className="text-slate-400" />
          ) : (
            <ChevronRight size={15} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Opciones Expandidas */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-2.5 pb-2.5 pt-2">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {group.options.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                optQty={getOptionQuantity(group.id, option.id)}
                isSingleChoice={isSingleChoice}
                effectiveMax={effectiveMax}
                selectedQty={selectedQty}
                onUpdateQuantity={(opt, delta) =>
                  onUpdateQuantity(group.id, opt, delta, effectiveMax)
                }
                onAutoAdvance={() => onAutoAdvance(group.id)}
              />
            ))}
          </div>

          {selectedOptions.length > 0 && (
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="truncate text-[9px] font-bold text-slate-500">
                {selectionSummary}
              </span>
              {isCompleted && (
                <button
                  type="button"
                  onClick={() => onToggleExpand(group.id)}
                  className="ml-2 flex shrink-0 items-center gap-1 text-[9px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Check size={11} strokeWidth={3} />
                  Listo
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}