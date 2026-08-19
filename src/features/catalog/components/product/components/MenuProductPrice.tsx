"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Pencil,
  Check,
  X,
  Tag,
  Percent,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/features/common/utils/formatPrice";

interface Props {
  finalPrice?: string | number;
  originalPrice?: string | number;
  discountPercentage?: string | number;
  cost?: string | number;
  currencyMask?: string;
  onUpdate: (data: {
    finalPrice: number;
    originalPrice: number;
    discountPercentage: number;
    cost: number;
  }) => void;
}

export default function MenuProductPrice({
  originalPrice,
  discountPercentage,
  cost,
  currencyMask = "$",
  onUpdate,
}: Props) {
  const [editing, setEditing] = useState(false);

  const [productData, setProductData] = useState<{
    originalPrice: string;
    discountPercentage: string;
    cost: string;
  }>({
    originalPrice: "",
    discountPercentage: "",
    cost: "",
  });

  const originalPriceInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------
  // Sync props -> state
  // ---------------------------------------------------------

  useEffect(() => {
    setProductData({
      originalPrice: originalPrice?.toString() ?? "",
      discountPercentage: discountPercentage?.toString() ?? "",
      cost: cost?.toString() ?? "",
    });
  }, [originalPrice, discountPercentage, cost]);

  // ---------------------------------------------------------
  // Focus
  // ---------------------------------------------------------

  useEffect(() => {
    if (editing && originalPriceInputRef.current) {
      originalPriceInputRef.current.focus();
      originalPriceInputRef.current.select();
    }
  }, [editing]);

  // ---------------------------------------------------------
  // Precio final
  // ---------------------------------------------------------

  const calculatedFinalPrice = useMemo(() => {
    if (productData.originalPrice !== "") {
      const op = parseFloat(productData.originalPrice);
      const dp = parseFloat(productData.discountPercentage || "0");

      if (isNaN(op) || op <= 0) return "0.00";

      if (isNaN(dp) || dp <= 0) {
        return op.toFixed(2);
      }

      return (op - (op * dp) / 100).toFixed(2);
    }

    return "0.00";
  }, [productData]);

  // ---------------------------------------------------------
  // Métricas
  // ---------------------------------------------------------

  const profitMetrics = useMemo(() => {
    const fp = parseFloat(calculatedFinalPrice);
    const c = parseFloat(productData.cost || "0");

    if (isNaN(fp) || fp <= 0) {
      return null;
    }

    const netProfit = fp - c;
    const marginPercentage = fp > 0 ? (netProfit / fp) * 100 : 0;

    return {
      netProfit,
      marginPercentage: Math.round(marginPercentage),
      isProfitable: netProfit > 0,
    };
  }, [calculatedFinalPrice, productData.cost]);

  // ---------------------------------------------------------
  // Confirmar
  // ---------------------------------------------------------

  const handleConfirm = () => {
    const op = parseFloat(productData.originalPrice || "0") || 0;
    const dp = parseFloat(productData.discountPercentage || "0") || 0;
    const fp = parseFloat(calculatedFinalPrice) || op;
    const c = parseFloat(productData.cost || "0") || 0;

    onUpdate({
      originalPrice: op,
      discountPercentage: dp,
      finalPrice: fp,
      cost: c,
    });

    setEditing(false);
  };

  // ---------------------------------------------------------
  // Cancelar
  // ---------------------------------------------------------

  const handleCancel = () => {
    setProductData({
      originalPrice: originalPrice?.toString() ?? "",
      discountPercentage: discountPercentage?.toString() ?? "",
      cost: cost?.toString() ?? "",
    });

    setEditing(false);
  };

  // ---------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // ---------------------------------------------------------
  // Inputs
  // ---------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (/^\d*\.?\d*$/.test(value)) {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ---------------------------------------------------------
  // Display
  // ---------------------------------------------------------

  const hasDiscount = parseFloat(productData.discountPercentage || "0") > 0;

  const finalPriceDisplay = formatPrice(calculatedFinalPrice, currencyMask);

  const originalPriceDisplay = formatPrice(
    productData.originalPrice || "0",
    currencyMask,
  );

  const costDisplay = formatPrice(productData.cost || "0", currencyMask);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full">
      {!editing ? (
        // ===================================================
        // MODO VISTA
        // ===================================================
        <div className="flex items-center justify-between gap-3 px-1 py-1">
          {/* Información */}
          <div
            className="min-w-0 flex-1 cursor-pointer"
            onClick={() => setEditing(true)}
          >
            {/* Precio */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="text-xl font-bold text-gray-900 leading-none">
                {finalPriceDisplay}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-sm text-gray-400 line-through leading-none">
                    {originalPriceDisplay}
                  </span>

                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-md leading-none">
                    -{productData.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Costos / ganancia */}
            {profitMetrics ? (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                <span className="text-[11px] text-gray-500">
                  Costo{" "}
                  <span className="font-medium text-gray-700">
                    {costDisplay}
                  </span>
                </span>

                <span className="text-gray-300">•</span>

                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    profitMetrics.isProfitable
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  Ganancia {formatPrice(profitMetrics.netProfit, currencyMask)}
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded ${
                      profitMetrics.isProfitable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {profitMetrics.marginPercentage}%
                  </span>
                </span>
              </div>
            ) : (
              <div className="mt-1 text-[10px] text-gray-400">
                Sin información de costo
              </div>
            )}
          </div>

          {/* Editar */}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-lg"
            aria-label="Editar precios"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 shadow-sm"
          onKeyDown={handleKeyDown}
        >
          {/* Inputs */}
          <div className="grid grid-cols-3 gap-2.5">
            <InputGroup
              label="Precio Base"
              name="originalPrice"
              value={productData.originalPrice}
              onChange={handleChange}
              ref={originalPriceInputRef}
              currencyMask={currencyMask}
              Icon={Tag}
            />

            <InputGroup
              label="Descuento"
              name="discountPercentage"
              value={productData.discountPercentage}
              onChange={handleChange}
              suffix="%"
              Icon={Percent}
              inputClasses="text-green-700"
            />

            <InputGroup
              label="Costo"
              name="cost"
              value={productData.cost}
              onChange={handleChange}
              currencyMask={currencyMask}
              Icon={DollarSign}
              inputClasses="text-gray-700"
            />
          </div>

          {/* =================================================
      RESULTADO
  ================================================= */}
          <div className="mt-3 rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {/* Precio de venta */}
              <div className="px-3 py-2.5">
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Precio de venta
                </span>

                <span className="mt-0.5 block text-lg font-bold leading-tight text-gray-900">
                  {finalPriceDisplay}
                </span>
              </div>

              {/* Costo */}
              <div className="px-3 py-2.5">
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Costo
                </span>

                <span className="mt-0.5 block text-sm font-semibold leading-tight text-gray-700">
                  {costDisplay}
                </span>
              </div>

              {/* Ganancia */}
              <div className="px-3 py-2.5">
                <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Ganancia
                </span>

                {profitMetrics ? (
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold leading-tight ${
                        profitMetrics.isProfitable
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPrice(profitMetrics.netProfit, currencyMask)}
                    </span>

                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        profitMetrics.isProfitable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {profitMetrics.marginPercentage}%
                    </span>
                  </div>
                ) : (
                  <span className="mt-0.5 block text-xs italic text-gray-400">
                    —
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
      ACCIONES
  ================================================= */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Enter para guardar · Esc para cancelar
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                title="Cancelar (Esc)"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                title="Guardar (Enter)"
              >
                <Check className="h-3.5 w-3.5" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// INPUT GROUP
// =============================================================

interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currencyMask?: string;
  suffix?: string;
  Icon: React.ElementType;
  inputClasses?: string;
}

const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      currencyMask,
      suffix,
      Icon,
      inputClasses = "",
    },
    ref,
  ) => (
    <div className="flex flex-col w-full min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-gray-500 shrink-0" />

        <label
          htmlFor={name}
          className="text-[9px] font-semibold text-gray-600 uppercase tracking-tight truncate"
        >
          {label}
        </label>
      </div>

      <div className="flex items-center bg-white rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm transition-all min-w-0">
        {currencyMask && (
          <span className="text-xs font-semibold text-gray-500 ml-2 shrink-0">
            {currencyMask}
          </span>
        )}

        <input
          ref={ref}
          id={name}
          type="text"
          name={name}
          className={`w-full min-w-0 text-xs font-semibold outline-none bg-transparent py-1.5 px-1 text-right ${inputClasses}`}
          value={value || ""}
          onChange={onChange}
          placeholder="0"
          aria-label={label}
          inputMode="decimal"
        />

        {suffix && (
          <span className="text-xs font-semibold text-gray-500 mr-2 shrink-0">
            {suffix}
          </span>
        )}
      </div>
    </div>
  ),
);

InputGroup.displayName = "InputGroup";
