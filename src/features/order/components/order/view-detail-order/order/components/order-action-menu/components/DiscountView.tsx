import { useState } from "react";
import { Tag, Loader2 } from "lucide-react";
import { MenuHeader } from "./MenuHeader";

interface DiscountViewProps {
  subtotal: number;
  initialType: "PERCENTAGE" | "FIXED";
  initialValue: string;
  hasDiscount: boolean;
  isSaving: boolean;
  onBack: () => void;
  onApplyDiscount: (type: "PERCENTAGE" | "FIXED", value: number) => void;
  onRemoveDiscount?: () => void;
}

export function DiscountView({
  subtotal,
  initialType,
  initialValue,
  hasDiscount,
  isSaving,
  onBack,
  onApplyDiscount,
  onRemoveDiscount,
}: DiscountViewProps) {
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(initialType);
  const [discountValue, setDiscountValue] = useState(initialValue);

  const numericValue = Number(discountValue) || 0;
  const previewDiscount =
    discountType === "PERCENTAGE"
      ? Math.min(subtotal, subtotal * (numericValue / 100))
      : Math.min(subtotal, numericValue);

  const previewTotal = Math.max(0, subtotal - previewDiscount);

  return (
    <>
      <MenuHeader
        title={hasDiscount ? "Modificar descuento" : "Aplicar descuento"}
        icon={<Tag size={15} className="text-emerald-500" />}
        onBack={onBack}
      />
      <div className="space-y-3 p-3">
        <div>
          <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
            Tipo de descuento
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setDiscountType("PERCENTAGE")}
              className={`rounded-md py-2 text-[10px] font-black transition-all ${
                discountType === "PERCENTAGE"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              % PORCENTAJE
            </button>
            <button
              type="button"
              onClick={() => setDiscountType("FIXED")}
              className={`rounded-md py-2 text-[10px] font-black transition-all ${
                discountType === "FIXED"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              $ FIJO
            </button>
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
            Valor
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
              {discountType === "PERCENTAGE" ? "%" : "$"}
            </span>
            <input
              type="number"
              min="0"
              max={discountType === "PERCENTAGE" ? 100 : subtotal}
              step="any"
              autoFocus
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="0"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="flex justify-between text-[10px]">
            <span className="font-bold text-slate-500">Subtotal</span>
            <span className="font-black text-slate-700">${subtotal.toLocaleString("es-AR")}</span>
          </div>
          <div className="mt-1 flex justify-between text-[10px]">
            <span className="font-bold text-emerald-600">Descuento</span>
            <span className="font-black text-emerald-600">
              -${previewDiscount.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
            <span className="text-xs font-black text-slate-700">Total</span>
            <span className="text-sm font-black text-slate-900">
              ${previewTotal.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={isSaving || !discountValue || numericValue <= 0}
          onClick={() => onApplyDiscount(discountType, numericValue)}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-xs font-black text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
          {hasDiscount ? "Actualizar descuento" : "Aplicar descuento"}
        </button>

        {hasDiscount && onRemoveDiscount && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onRemoveDiscount}
            className="w-full rounded-lg py-2 text-[10px] font-black text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Quitar descuento
          </button>
        )}
      </div>
    </>
  );
}