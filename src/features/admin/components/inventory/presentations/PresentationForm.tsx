"use client";

import { useState } from "react";

import type { InventoryPresentationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-presentation.model";
import type {
  CreatePresentationInput,
  UpdatePresentationInput,
} from "@/mini-back/core/inventory-core/public";
import { inventoryPresentationOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-presentation-orchestrator";

interface PresentationFormProps {
  businessId: string;
  inventoryProductIdTemp: string;
  presentation: InventoryPresentationModel | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}

export default function PresentationForm({
  businessId,
  inventoryProductIdTemp,
  presentation,
  onCancel,
  onSaved,
}: PresentationFormProps) {
  const [name, setName] = useState(presentation?.name ?? "");
  const [conversionFactor, setConversionFactor] = useState(
    presentation?.conversionFactor.toString() ?? "",
  );
  const [barcode, setBarcode] = useState(presentation?.barcode ?? "");
  const [isDefault, setIsDefault] = useState(presentation?.isDefault ?? false);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      if (presentation) {
        const input: UpdatePresentationInput = {
          idTemp: presentation.idTemp,
          name,
          conversionFactor: Number(conversionFactor),
          barcode: barcode || null,
          businessId,
        };

        await inventoryPresentationOrchestrator.update(input);
      } else {
        const input: CreatePresentationInput = {
          inventoryProductIdTemp,
          name,
          conversionFactor: Number(conversionFactor),
          barcode: barcode || null,
          isDefault,
          businessId,
          idTemp: crypto.randomUUID(),
        };

        await inventoryPresentationOrchestrator.create(input);
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
        {presentation ? "Editar presentación" : "Nueva presentación"}
      </h3>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nombre de presentación *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Caja x 24, Saco 50kg, Six-pack"
            required
            className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Factor de conversión (Equivalencia en unidades) *
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={conversionFactor}
            onChange={(e) => setConversionFactor(e.target.value)}
            placeholder="Ej: 24 (1 caja contiene 24 unidades)"
            required
            className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Código de barras de la presentación
          </label>
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="EAN / UPC de la caja o paquete"
            className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            Establecer como presentación predeterminada al ingresar stock
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar presentación"}
          </button>
        </div>
      </form>
    </div>
  );
}