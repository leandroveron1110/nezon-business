"use client";

import { FormEvent, useState } from "react";

import type { TransferStockInput } from "@/mini-back/core/inventory-core/inputs/stock/transfer-stock.input";
import { inventoryStockOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-stock-orchestrator";

interface TransferStockModalProps {
  businessId: string;
  inventoryProductIdTemp: string;
  fromLocationIdTemp: string;
  toLocationIdTemp?: string;
  lotIdTemp?: string | null;
  onSuccess?: () => void;
  onClose: () => void;
}

export default function TransferStockModal({
  businessId,
  inventoryProductIdTemp,
  fromLocationIdTemp,
  toLocationIdTemp = "",
  lotIdTemp = null,
  onSuccess,
  onClose,
}: TransferStockModalProps) {
  const [destinationLocationIdTemp, setDestinationLocationIdTemp] =
    useState(toLocationIdTemp);

  const [quantityBase, setQuantityBase] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input: TransferStockInput = {
      businessId,
      inventoryProductIdTemp,
      fromLocationIdTemp,
      toLocationIdTemp: destinationLocationIdTemp,
      quantityBase: Number(quantityBase),
      lotIdTemp,
      notes: notes || null,
    };

    setLoading(true);

    try {
      await inventoryStockOrchestrator.transfer(input);

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
              Transferir stock
            </h2>
            <p className="text-xs text-slate-500">
              Mueve existencias entre ubicaciones o depósitos
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
              Ubicación de destino *
            </label>
            <input
              type="text"
              value={destinationLocationIdTemp}
              onChange={(event) =>
                setDestinationLocationIdTemp(event.target.value)
              }
              placeholder="ID temporal ubicación destino"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cantidad a transferir *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={quantityBase}
              onChange={(event) => setQuantityBase(event.target.value)}
              placeholder="Ej: 15"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Notas u observaciones
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Motivo o detalles del traslado..."
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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Transferir stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}