"use client";

import { Check, Minus, Plus } from "lucide-react";
import { LocalOption } from "@/mini-back/infrastructure/dexie/shcema/products.schema";

interface OptionRowProps {
  option: LocalOption;
  optQty: number;
  isSingleChoice: boolean;
  effectiveMax: number;
  selectedQty: number;
  onUpdateQuantity: (option: LocalOption, delta: number) => void;
  onAutoAdvance?: () => void;
}

export function OptionRow({
  option,
  optQty,
  isSingleChoice,
  effectiveMax,
  selectedQty,
  onUpdateQuantity,
  onAutoAdvance,
}: OptionRowProps) {
  const isSelected = optQty > 0;
  const price = Number(option.priceFinal || 0);

  const handleClick = () => {
    if (!option.hasStock) return;

    if (isSingleChoice) {
      onUpdateQuantity(option, 1);
      if (onAutoAdvance) {
        setTimeout(onAutoAdvance, 0);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex min-h-[42px] items-center justify-between rounded border p-1.5 transition-all ${
        isSelected
          ? "border-emerald-600 bg-emerald-50/80 shadow-2xs"
          : "border-slate-200 bg-white hover:bg-slate-50"
      } ${!option.hasStock ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="truncate text-[11px] font-black leading-tight text-slate-800">
          {option.name}
        </p>
        <p className="mt-0.5 text-[9.5px] font-bold leading-none text-slate-500">
          {price > 0 ? `+$${price}` : "Incluido"}
        </p>
      </div>

      {isSingleChoice ? (
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            isSelected
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-300 bg-white"
          }`}
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </div>
      ) : (
        <div
          className="flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-100 p-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={optQty === 0}
            onClick={() => onUpdateQuantity(option, -1)}
            className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-700 transition-colors hover:bg-slate-200 active:bg-slate-300 disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>

          <span className="w-4 text-center text-[11px] font-black text-slate-800">
            {optQty}
          </span>

          <button
            type="button"
            disabled={
              !option.hasStock ||
              (effectiveMax > 0 && selectedQty >= effectiveMax)
            }
            onClick={() => onUpdateQuantity(option, 1)}
            className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}