"use client";

import { FormEvent, useState } from "react";

import type { ConsumeStockInput } from "@/mini-back/core/inventory-core/inputs/stock/consume-stock.input";
import { InventoryMovementReason } from "@/mini-back/core/inventory-core/domain/enums/inventory-movement-reason.enum";
import { InventoryMovementReferenceType } from "@/mini-back/core/inventory-core/domain/enums/inventory-movement-ref-type.enum";
import { StockWithdrawalStrategy } from "@/mini-back/core/inventory-core/domain/enums/stock-withdrawal-strategy.enum";
import { inventoryStockOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-stock-orchestrator";

interface ConsumeStockModalProps {
  businessId: string;
  inventoryProductIdTemp: string;
  locationIdTemp: string;
  onSuccess?: () => void;
  onClose: () => void;
}

// Razones más comunes para acceso en 1-click
const QUICK_REASONS = [
  { value: InventoryMovementReason.CONSUMPTION, label: "Consumo" },
  { value: InventoryMovementReason.WASTE, label: "Merma" },
  { value: InventoryMovementReason.EXPIRED, label: "Vencido" },
  { value: InventoryMovementReason.MANUAL_ADJUSTMENT, label: "Ajuste" },
];

const REASON_LABELS: Record<InventoryMovementReason, string> = {
  [InventoryMovementReason.INITIAL_ADJUSTMENT]: "Ajuste inicial",
  [InventoryMovementReason.MANUAL_ADJUSTMENT]: "Ajuste manual",
  [InventoryMovementReason.TRANSFER]: "Transferencia",
  [InventoryMovementReason.CONSUMPTION]: "Consumo interno",
  [InventoryMovementReason.PRODUCTION]: "Producción",
  [InventoryMovementReason.RECEIPT]: "Recepción / Compra",
  [InventoryMovementReason.WASTE]: "Mermas / Desperdicio",
  [InventoryMovementReason.EXPIRED]: "Vencimiento",
};

const STRATEGY_LABELS: Record<StockWithdrawalStrategy, string> = {
  [StockWithdrawalStrategy.FEFO]: "Primero en vencer (FEFO)",
  [StockWithdrawalStrategy.FIFO]: "Primero en entrar (FIFO)",
  [StockWithdrawalStrategy.LIFO]: "Último en entrar (LIFO)",
  [StockWithdrawalStrategy.EXPLICIT_LOT]: "Lote específico",
  [StockWithdrawalStrategy.MANUAL_SELECTION]: "Manual",
};

export default function ConsumeStockModal({
  businessId,
  inventoryProductIdTemp,
  locationIdTemp,
  onSuccess,
  onClose,
}: ConsumeStockModalProps) {
  const [quantityBase, setQuantityBase] = useState("");
  const [reason, setReason] = useState<InventoryMovementReason>(
    InventoryMovementReason.CONSUMPTION,
  );
  const [withdrawalStrategy, setWithdrawalStrategy] =
    useState<StockWithdrawalStrategy>(StockWithdrawalStrategy.FEFO);

  const [lotIdTemp, setLotIdTemp] = useState("");
  const [referenceType, setReferenceType] = useState<
    InventoryMovementReferenceType | ""
  >("");
  const [referenceIdTemp, setReferenceIdTemp] = useState("");
  const [notes, setNotes] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  // Agregar/Sumar cantidad rápidamente
  const handleAddQuantity = (val: number) => {
    const current = parseFloat(quantityBase) || 0;
    setQuantityBase(String(current + val));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quantityBase || Number(quantityBase) <= 0) return;

    const input: ConsumeStockInput = {
      businessId,
      inventoryProductIdTemp,
      locationIdTemp,
      quantityBase: Number(quantityBase),
      reason,
      withdrawalStrategy,
      lotIdTemp:
        withdrawalStrategy === StockWithdrawalStrategy.EXPLICIT_LOT
          ? lotIdTemp || null
          : null,
      referenceType: referenceType || null,
      referenceIdTemp: referenceIdTemp || null,
      notes: notes || null,
    };

    setLoading(true);

    try {
      await inventoryStockOrchestrator.consume(input);
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between border-b pb-2 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Descontar Stock
            </h2>
            <p className="text-[11px] text-slate-500">
              Registra una salida rápida del inventario
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Principal: Cantidad */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Cantidad a descontar *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                step="any"
                autoFocus
                value={quantityBase}
                onChange={(e) => setQuantityBase(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 p-2 text-lg font-semibold text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              {/* Presets rápidos */}
              <div className="flex gap-1">
                {[1, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleAddQuantity(num)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Motivo Rápido (Chips) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Motivo de salida
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_REASONS.map((item) => {
                const active = reason === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setReason(item.value)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector avanzado oculto/desplegable opcional */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              {showAdvanced ? "— Ocultar detalles adicionales" : "+ Más opciones (Lote, Referencia, Notas)"}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              {/* Todos los motivos si no está en las rápidas */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Otros motivos
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as InventoryMovementReason)}
                  className="w-full rounded-md border border-slate-300 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {Object.values(InventoryMovementReason).map((val) => (
                    <option key={val} value={val}>
                      {REASON_LABELS[val] ?? val}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estrategia de Extracción */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Estrategia de extracción
                </label>
                <select
                  value={withdrawalStrategy}
                  onChange={(e) => setWithdrawalStrategy(e.target.value as StockWithdrawalStrategy)}
                  className="w-full rounded-md border border-slate-300 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {Object.values(StockWithdrawalStrategy).map((val) => (
                    <option key={val} value={val}>
                      {STRATEGY_LABELS[val] ?? val}
                    </option>
                  ))}
                </select>
              </div>

              {withdrawalStrategy === StockWithdrawalStrategy.EXPLICIT_LOT && (
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    ID de Lote Específico *
                  </label>
                  <input
                    type="text"
                    value={lotIdTemp}
                    onChange={(e) => setLotIdTemp(e.target.value)}
                    placeholder="Ej: LOT-2024-001"
                    className="w-full rounded-md border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              )}

              {/* Referencia */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">
                    Ref. Tipo
                  </label>
                  <select
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value as InventoryMovementReferenceType | "")}
                    className="w-full rounded border border-slate-300 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Sin ref.</option>
                    {Object.values(InventoryMovementReferenceType).map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">
                    Ref. ID
                  </label>
                  <input
                    type="text"
                    value={referenceIdTemp}
                    onChange={(e) => setReferenceIdTemp(e.target.value)}
                    placeholder="OP-104"
                    className="w-full rounded border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones..."
                  rows={2}
                  className="w-full rounded border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Acciones del Modal */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !quantityBase || Number(quantityBase) <= 0}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Confirmar salida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}