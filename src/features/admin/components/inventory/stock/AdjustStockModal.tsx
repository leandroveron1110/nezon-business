"use client";

import { FormEvent, useState } from "react";

import type { AdjustStockInput } from "@/mini-back/core/inventory-core/inputs/stock/adjust-stock.input";
import { InventoryMovementReason } from "@/mini-back/core/inventory-core/domain/enums/inventory-movement-reason.enum";
import { inventoryStockOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-stock-orchestrator";

interface AdjustStockModalProps {
  businessId: string;
  inventoryProductIdTemp: string;
  locationIdTemp: string;
  lotIdTemp?: string | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const REASON_LABELS: Record<InventoryMovementReason, string> = {
  [InventoryMovementReason.INITIAL_ADJUSTMENT]: "Ajuste inicial",
  [InventoryMovementReason.MANUAL_ADJUSTMENT]: "Ajuste manual / Conteo físico",
  [InventoryMovementReason.TRANSFER]: "Transferencia",
  [InventoryMovementReason.CONSUMPTION]: "Consumo interno",
  [InventoryMovementReason.PRODUCTION]: "Producción",
  [InventoryMovementReason.RECEIPT]: "Recepción / Compra",
  [InventoryMovementReason.WASTE]: "Mermas / Desperdicio",
  [InventoryMovementReason.EXPIRED]: "Vencimiento",
};

export default function AdjustStockModal({
  businessId,
  inventoryProductIdTemp,
  locationIdTemp,
  lotIdTemp = null,
  onSuccess,
  onClose,
}: AdjustStockModalProps) {
  const [countedQuantityBase, setCountedQuantityBase] =
    useState("");

  const [reason, setReason] = useState<InventoryMovementReason>(
    InventoryMovementReason.MANUAL_ADJUSTMENT,
  );

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: AdjustStockInput = {
      businessId,
      inventoryProductIdTemp,
      locationIdTemp,
      lotIdTemp,
      countedQuantityBase: Number(countedQuantityBase),
      reason,
      notes: notes || null,
    };

    setLoading(true);

    try {
      await inventoryStockOrchestrator.adjust(input);

      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Ajustar stock
            </h2>
            <p className="text-xs text-slate-500">
              Establece el conteo real detectado en físico
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cantidad real contada *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={countedQuantityBase}
              onChange={(event) =>
                setCountedQuantityBase(event.target.value)
              }
              placeholder="Ej: 20"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Esta cantidad reemplazará el valor actual del inventario.
            </span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Motivo del ajuste *
            </label>
            <select
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value as InventoryMovementReason,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {Object.values(InventoryMovementReason).map((value) => (
                <option key={value} value={value}>
                  {REASON_LABELS[value] ?? value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Observaciones
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Razón de la discrepancia..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Ajustar stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}