// src/features/admin/components/treasury/components/TransferTreasuryModal.tsx
"use client";

import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";
import { TreasuryAccountOrchestrator } from "@/mini-back/orchestrator/treasury-account/treasury-account-orchestrator";

interface TransferTreasuryModalProps {
  businessId: string;
  accounts: TreasuryAccount[];
  onClose: () => void;
  onTransferred: () => void;
}

export function TransferTreasuryModal({
  businessId,
  accounts,
  onClose,
  onTransferred,
}: TransferTreasuryModalProps) {
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sourceId || !destinationId) {
      setError("Debes seleccionar cuenta de origen y destino.");
      return;
    }

    if (sourceId === destinationId) {
      setError("La cuenta de origen y destino no pueden ser la misma.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Ingresa un monto válido mayor a cero.");
      return;
    }

    try {
      setIsSubmitting(true);
      const orchestrator = new TreasuryAccountOrchestrator();

      await orchestrator.transfer({
        idTemp: crypto.randomUUID(),
        idTempIncoming: crypto.randomUUID(),
        externalReference: "",
        businessId,
        sourceTreasuryAccountId: sourceId,
        destinationTreasuryAccountId: destinationId,
        amount: Number(amount),
        description: description || "Transferencia entre cuentas",
        userId: "user_temp_id", // Asignar el ID de usuario activo
        notes: "",
      });

      onTransferred();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al procesar la transferencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Transferir Fondos</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700">Cuenta Origen</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Seleccionar origen</option>
              {accounts.map((acc) => (
                <option key={acc.idTemp} value={acc.idTemp}>
                  {acc.name} (${acc.currentBalance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Cuenta Destino</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Seleccionar destino</option>
              {accounts
                .filter((acc) => acc.idTemp !== sourceId)
                .map((acc) => (
                  <option key={acc.idTemp} value={acc.idTemp}>
                    {acc.name} (${acc.currentBalance})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Monto</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Descripción (Opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Movimiento a caja fuerte"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-lg border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-1/2 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? "Procesando..." : "Confirmar"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}