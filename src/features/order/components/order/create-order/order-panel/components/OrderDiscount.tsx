"use client";

import { useEffect, useRef, useState } from "react";
import { Tag, X } from "lucide-react";

export type DiscountType = "PERCENTAGE" | "FIXED" | null;

interface OrderDiscountProps {
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  setDiscountType: (value: DiscountType) => void;
  setDiscountValue: (value: number) => void;
  setDiscountAmount: (value: number) => void;
}

function formatFixedValue(value: number): string {
  if (!value) return "0";
  return new Intl.NumberFormat("es-AR").format(value);
}

const QUICK_PERCENTAGES = [10, 15, 20];

export function OrderDiscount({
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  setDiscountType,
  setDiscountValue,
  setDiscountAmount,
}: OrderDiscountProps) {
  const [isOpen, setIsOpen] = useState(discountType !== null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado interno cuando cambian las props desde afuera
  useEffect(() => {
    if (discountType === "FIXED") {
      setInputValue(discountValue > 0 ? formatFixedValue(discountValue) : "");
      setIsOpen(true);
    } else if (discountType === "PERCENTAGE") {
      setInputValue(discountValue > 0 ? String(discountValue) : "");
      setIsOpen(true);
    } else {
      setInputValue("");
      setIsOpen(false);
    }
  }, [discountType, discountValue]);

  // Aplicar lógica de cálculo
  const applyDiscount = (type: DiscountType, val: number) => {
    if (type === null || val <= 0) {
      setDiscountType(null);
      setDiscountValue(0);
      setDiscountAmount(0);
      setInputValue("");
      return;
    }

    if (type === "PERCENTAGE") {
      const percentage = Math.min(val, 100);
      const amount = Math.round(subtotal * (percentage / 100));
      setDiscountType("PERCENTAGE");
      setDiscountValue(percentage);
      setDiscountAmount(amount);
    } else if (type === "FIXED") {
      const fixed = Math.min(val, subtotal);
      setDiscountType("FIXED");
      setDiscountValue(fixed);
      setDiscountAmount(fixed);
    }
  };

  const handleValueChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    const currentType = discountType || "PERCENTAGE";

    if (!digits) {
      setInputValue("");
      setDiscountValue(0);
      setDiscountAmount(0);
      return;
    }

    applyDiscount(currentType, Number(digits));
  };

  // Abrir panel
  const handleOpen = () => {
    setIsOpen(true);
    const defaultType = discountType || "PERCENTAGE";
    setDiscountType(defaultType);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
  };

  // Quitar descuento y cerrar intencionalmente
  const handleRemove = () => {
    setDiscountType(null);
    setDiscountValue(0);
    setDiscountAmount(0);
    setInputValue("");
    setIsOpen(false);
  };

  // Cambiar entre % y $ sin cerrar el panel
  const handleTypeToggle = (type: DiscountType) => {
    if (discountType === type) return;

    setDiscountType(type);
    setDiscountValue(0);
    setDiscountAmount(0);
    setInputValue("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  };

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-2 py-1 select-none">
      {!isOpen ? (
        <div className="flex h-6 items-center justify-between">
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Tag size={11} className="text-slate-400" />
            <span>+ Aplicar Descuento</span>
          </button>
        </div>
      ) : (
        <div className="flex h-7 items-center justify-between gap-1.5 animate-in fade-in duration-150">
          
          {/* Preset Chips rápidos (%) */}
          <div className="flex items-center gap-1">
            {QUICK_PERCENTAGES.map((pct) => {
              const isActive = discountType === "PERCENTAGE" && discountValue === pct;
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyDiscount("PERCENTAGE", pct)}
                  className={`h-6 px-1.5 rounded text-[9px] font-black transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pct}%
                </button>
              );
            })}
          </div>

          {/* Input Manual + Badge del total descontado */}
          <div className="flex items-center gap-1">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={inputValue}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={discountType === "FIXED" ? "Monto" : "%"}
                className="h-6 w-16 rounded border border-slate-300 bg-slate-50 px-1 pr-3.5 text-right text-[10px] font-black text-slate-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
              <span className="pointer-events-none absolute right-1 text-[8px] font-black text-slate-400">
                {discountType === "FIXED" ? "$" : "%"}
              </span>
            </div>

            {discountAmount > 0 && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-800 border border-emerald-300 whitespace-nowrap">
                -${formatFixedValue(discountAmount)}
              </span>
            )}
          </div>

          {/* Selector de tipo (% / $) + Botón Cierre (X) */}
          <div className="flex items-center gap-1">
            <div className="flex h-6 rounded bg-slate-100 p-0.5 font-black text-[9px]">
              <button
                type="button"
                onClick={() => handleTypeToggle("PERCENTAGE")}
                className={`w-5 rounded transition-all ${
                  discountType === "PERCENTAGE"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Descuento Porcentual"
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleTypeToggle("FIXED")}
                className={`w-5 rounded transition-all ${
                  discountType === "FIXED"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Descuento Fijo ($)"
              >
                $
              </button>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Quitar Descuento"
            >
              <X size={13} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}