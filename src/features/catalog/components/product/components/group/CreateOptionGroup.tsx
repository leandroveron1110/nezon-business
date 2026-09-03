"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

export type QuantityType = "FIXED" | "MIN_MAX";

export interface CreateOptionGroupData {
  name: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: QuantityType;
}

interface CreateOptionGroupProps {
  onCreate: (data: CreateOptionGroupData) => void;
  onCancel: () => void;
}

export default function CreateOptionGroup({
  onCreate,
  onCancel,
}: CreateOptionGroupProps) {
  const [name, setName] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [quantityType, setQuantityType] = useState<QuantityType>("MIN_MAX");
  const [fixedQuantity, setFixedQuantity] = useState<number>(1);
  const [minQuantity, setMinQuantity] = useState<number>(0);
  const [maxQuantity, setMaxQuantity] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    let finalMin = 0;
    let finalMax = 1;

    if (!isRequired) {
      // Si es OPCIONAL: el mínimo siempre es 0
      finalMin = 0;
      finalMax = Math.max(1, maxQuantity || 1);
    } else {
      // Si es OBLIGATORIO
      if (quantityType === "FIXED") {
        const qty = Math.max(1, fixedQuantity || 1);
        finalMin = qty;
        finalMax = qty;
      } else {
        // En rango obligatorio, el mínimo debe ser al menos 1
        finalMin = Math.max(1, minQuantity || 1);
        finalMax = Math.max(finalMin, maxQuantity || finalMin);
      }
    }

    onCreate({
      name: trimmedName,
      minQuantity: finalMin,
      maxQuantity: finalMax,
      quantityType: !isRequired ? "MIN_MAX" : quantityType,
    });
  };

  const isInvalid =
    !name.trim() ||
    (!isRequired && maxQuantity < 1) ||
    (isRequired && quantityType === "MIN_MAX" && (minQuantity < 1 || minQuantity > maxQuantity));

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          title="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-bold text-slate-900">
          Nuevo grupo de opciones
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        {/* Nombre */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Nombre del grupo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Salsas, Adicionales, Término de la carne"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Obligatoriedad */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            ¿Es obligatorio elegir al menos una opción?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRequired(false);
                setMinQuantity(0);
              }}
              className={`rounded-xl border py-2 text-xs font-semibold transition ${
                !isRequired
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Opcional (Mínimo 0)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRequired(true);
                if (minQuantity === 0) setMinQuantity(1);
              }}
              className={`rounded-xl border py-2 text-xs font-semibold transition ${
                isRequired
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Obligatorio (Mínimo 1+)
            </button>
          </div>
        </div>

        {/* Modalidad de Selección (Solo si es obligatorio) */}
        {isRequired && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Tipo de selección
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuantityType("FIXED")}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  quantityType === "FIXED"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Cantidad exacta
              </button>
              <button
                type="button"
                onClick={() => setQuantityType("MIN_MAX")}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  quantityType === "MIN_MAX"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Rango (Mín / Máx)
              </button>
            </div>
          </div>
        )}

        {/* Inputs numéricos ajustados a la opción seleccionada */}
        <div className="rounded-xl bg-slate-50/80 p-3">
          {!isRequired ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Límite máximo a elegir:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={maxQuantity}
                  onChange={(e) => setMaxQuantity(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-500">opción(es)</span>
              </div>
            </div>
          ) : quantityType === "FIXED" ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Debe elegir exactamente:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={fixedQuantity}
                  onChange={(e) => setFixedQuantity(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-500">opción(es)</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Mínimo obligatorio
                </label>
                <input
                  type="number"
                  min="1"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Máximo permitido
                </label>
                <input
                  type="number"
                  min={minQuantity || 1}
                  value={maxQuantity}
                  onChange={(e) => setMaxQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
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
          Crear grupo
        </button>
      </div>
    </form>
  );
}