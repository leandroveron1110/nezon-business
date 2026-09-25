"use client";

import { useState } from "react";

import type { InventoryLotModel } from "@/mini-back/core/inventory-core/domain/models/inventory-lot.model";
import type { CreateLotInput, UpdateLotInput } from "@/mini-back/core/inventory-core/public";
import { inventoryLotOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-lot-orchestrator";

interface LotFormProps {
  businessId: string;
  inventoryProductIdTemp: string;
  lot: InventoryLotModel | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}

export default function LotForm({
  businessId,
  inventoryProductIdTemp,
  lot,
  onCancel,
  onSaved,
}: LotFormProps) {
  const [lotNumber, setLotNumber] = useState(lot?.lotNumber ?? "");
  const [manufactureDate, setManufactureDate] = useState(lot?.manufactureDate ?? "");
  const [expirationDate, setExpirationDate] = useState(lot?.expirationDate ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (lot) {
        const input: UpdateLotInput = {
          idTemp: lot.idTemp,
          lotNumber: lotNumber.trim(),
          manufactureDate: manufactureDate || null,
          expirationDate: expirationDate || null,
          businessId,
        };

        await inventoryLotOrchestrator.update(input);
      } else {
        const input: CreateLotInput = {
          inventoryProductIdTemp,
          lotNumber: lotNumber.trim(),
          manufactureDate: manufactureDate || null,
          expirationDate: expirationDate || null,
          businessId,
          idTemp: crypto.randomUUID(),
        };

        await inventoryLotOrchestrator.create(input);
      }

      await onSaved();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al guardar el lote.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
        {lot ? "Editar lote" : "Nuevo lote"}
      </h3>

      <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Número de lote *
          </label>
          <input
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            placeholder="Ej: LOTE-2026-01"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Fecha de fabricación
          </label>
          <input
            type="date"
            value={manufactureDate}
            onChange={(e) => setManufactureDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-xs font-medium dark:border-slate-700 dark:text-slate-300"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}