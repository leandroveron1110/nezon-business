"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import type { CreateOptionData } from "@/features/catalog/types/product-options";

interface CreateCustomOptionProps {
  onCreate: (data: CreateOptionData) => void;
  onCancel: () => void;
}

export default function CreateCustomOption({
  onCreate,
  onCancel,
}: CreateCustomOptionProps) {
  const [name, setName] = useState("");
  const [priceFinal, setPriceFinal] = useState("0");
  const [hasStock, setHasStock] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    const numericPrice = Math.max(0, parseFloat(priceFinal) || 0);

    onCreate({
      name: trimmedName,
      priceFinal: numericPrice.toString(),
      // priceModifierType: numericPrice > 0 ? "INCREASE" : "NOT_CHANGE",
      hasStock,
      menuProductId: null,
    });
  };

  const isInvalid = !name.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          title="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h4 className="text-base font-bold text-slate-900">
          Nueva opción
        </h4>
      </div>

      <div className="mt-4 space-y-4">
        {/* Nombre */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Nombre de la opción
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Extra queso, Bacon, Mediana, Sin cebolla"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Precio y Stock en Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Precio Adicional */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Precio adicional
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-semibold text-slate-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={priceFinal}
                onChange={(e) => setPriceFinal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Toggle Disponible */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setHasStock(!hasStock)}
              className={`flex items-center justify-between rounded-xl border px-3.5 py-2 transition ${
                hasStock
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span className="text-xs font-semibold">
                {hasStock ? "Disponible" : "Sin stock"}
              </span>
              <div
                className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                  hasStock ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full bg-white transition-transform ${
                    hasStock ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isInvalid}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar opción
        </button>
      </div>
    </form>
  );
}