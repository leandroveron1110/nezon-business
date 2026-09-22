"use client";

import { LocalFinancialMovement } from "@/mini-back/infrastructure/dexie/shcema/financial-movement.schema";
import {
  FinancialMovementStatus,
  FinancialMovementType,
} from "@/mini-back/shared/enums/financial-movement-status.enum";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Receipt,
  Hash,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";

interface Props {
  movements: LocalFinancialMovement[];
  movementTypeLabels: Record<string, string>;
  paymentMethodLabels: Record<string, string>;
}

export function CashRegisterMovementsTable({
  movements,
  movementTypeLabels,
  paymentMethodLabels,
}: Props) {
  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
        <div className="rounded-full bg-slate-100 p-3 text-slate-400">
          <Receipt className="h-6 w-6" />
        </div>

        <h3 className="mt-3 font-semibold text-slate-700">
          Sin movimientos aún
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Las ventas, ingresos y egresos registrados en este turno aparecerán
          aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-800">Movimientos del Turno</h2>

        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {movements.length}{" "}
          {movements.length === 1 ? "operación" : "operaciones"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/80 font-semibold text-slate-500">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Detalle / Referencia</th>
              <th className="px-5 py-3">Medio de Pago</th>
              <th className="px-5 py-3">Hora</th>
              <th className="px-5 py-3 text-right">Monto</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {movements.map((m) => {
              // ---------------------------------------------------------
              // NATURALEZA DEL MOVIMIENTO
              // ---------------------------------------------------------

              const isSale =
                m.type === FinancialMovementType.SALE ||
                Boolean(m.orderId || m.orderIdTemp);

              const isExpense =
                m.type === FinancialMovementType.EXPENSE ||
                m.type === FinancialMovementType.REFUND ||
                m.type === FinancialMovementType.MERMAS;

              const isInternalTransferOut =
                m.type === FinancialMovementType.INTERNAL_TRANSFER_OUT;

              const isInternalTransferIn =
                m.type === FinancialMovementType.INTERNAL_TRANSFER_IN;

              const isNegative = isExpense || isInternalTransferOut;

              const isInactive =
                m.status === FinancialMovementStatus.CANCELLED ||
                m.status === FinancialMovementStatus.FAILED;

              const isPending = m.status === FinancialMovementStatus.PENDING;

              // Ingreso manual:
              // cualquier ingreso que no sea venta ni transferencia interna.
              const isManualIncome =
                !isNegative && !isSale && !isInternalTransferIn;

              // ---------------------------------------------------------
              // ICONO
              // ---------------------------------------------------------

              const MovementIcon =
                isInternalTransferOut || isInternalTransferIn
                  ? ArrowRightLeft
                  : isNegative
                    ? ArrowUpRight
                    : ArrowDownLeft;

              // ---------------------------------------------------------
              // COLOR DEL TIPO
              // ---------------------------------------------------------

              const movementTypeColor = isInactive
                ? "text-slate-400"
                : isInternalTransferOut
                  ? "text-amber-600"
                  : isInternalTransferIn
                    ? "text-sky-600"
                    : isNegative
                      ? "text-rose-600"
                      : isManualIncome
                        ? "text-blue-600"
                        : "text-emerald-600";

              // ---------------------------------------------------------
              // COLOR DEL MONTO
              // ---------------------------------------------------------

              const amountColor = isInactive
                ? "text-slate-400"
                : isInternalTransferOut
                  ? "text-amber-600"
                  : isInternalTransferIn
                    ? "text-sky-600"
                    : isNegative
                      ? "text-rose-600"
                      : isManualIncome
                        ? "text-blue-600"
                        : "text-slate-900";

              // ---------------------------------------------------------
              // TEXTO DEL TIPO
              // ---------------------------------------------------------

              const movementTypeLabel =
                movementTypeLabels[m.type] ||
                (isInternalTransferOut
                  ? "Transferencia enviada"
                  : isInternalTransferIn
                    ? "Transferencia recibida"
                    : m.type);

              // ---------------------------------------------------------
              // REFERENCIAS
              // ---------------------------------------------------------

              const displayOrderId = m.orderId || m.orderIdTemp;

              const hasTurnReference = Boolean(m.referenceCashRegisterTurnId);

              const formattedTime = new Date(m.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const shortOrderId = displayOrderId
                ? `${displayOrderId.slice(-6).toUpperCase()}`
                : null;

              const shortRefTurnId = m.referenceCashRegisterTurnId
                ? `${m.referenceCashRegisterTurnId.slice(-6).toUpperCase()}`
                : null;

              return (
                <tr
                  key={m.idTemp}
                  className={`transition hover:bg-slate-50/50 ${
                    isInactive ? "bg-slate-50/80 opacity-60" : ""
                  }`}
                >
                  {/* Secuencia */}
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {m.sequence}
                  </td>

                  {/* Tipo */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isInactive
                          ? "line-through text-slate-400"
                          : movementTypeColor
                      }`}
                    >
                      <MovementIcon className="h-3.5 w-3.5" />

                      {movementTypeLabel}
                    </span>
                  </td>

                  {/* Detalle */}
                  <td className="max-w-[320px] px-5 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate font-medium text-slate-800">
                          {m.description || "Movimiento sin descripción"}
                        </span>

                        {/* Orden */}
                        {shortOrderId && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                            <Hash className="h-2.5 w-2.5" />
                            {shortOrderId}
                          </span>
                        )}

                        {/* Transferencia interna */}
                        {isInternalTransferOut && (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            Sale de esta cuenta
                          </span>
                        )}

                        {isInternalTransferIn && (
                          <span className="inline-flex items-center gap-1 rounded border border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                            Ingresa a esta cuenta
                          </span>
                        )}

                        {/* Turno de referencia */}
                        {hasTurnReference && shortRefTurnId && (
                          <span
                            className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700"
                            title={`Monto proveniente del turno #${shortRefTurnId}`}
                          >
                            <LinkIcon className="h-2.5 w-2.5" />
                            Turno #{shortRefTurnId}
                          </span>
                        )}

                        {/* Pendiente */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            Pendiente
                          </span>
                        )}

                        {/* Cancelado / fallido */}
                        {isInactive && (
                          <span className="inline-flex items-center gap-1 rounded border border-rose-200/60 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                            <AlertTriangle className="h-2.5 w-2.5" />

                            {m.status === FinancialMovementStatus.CANCELLED
                              ? "Cancelado"
                              : "Fallido"}
                          </span>
                        )}
                      </div>

                      {/* Notas / referencia */}
                      {(m.notes || m.externalReference) && (
                        <span className="truncate text-[11px] text-slate-400">
                          {m.externalReference && (
                            <span className="font-mono">
                              Ref: {m.externalReference}{" "}
                            </span>
                          )}

                          {m.notes && <span>• {m.notes}</span>}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Medio de pago */}
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
                      {m.paymentMethod
                        ? paymentMethodLabels[m.paymentMethod]
                        : "—"}
                    </span>
                  </td>

                  {/* Hora */}
                  <td className="px-5 py-3.5 text-slate-500">
                    {formattedTime}
                  </td>

                  {/* Monto */}
                  <td
                    className={`px-5 py-3.5 text-right font-bold ${
                      isInactive ? "line-through text-slate-400" : amountColor
                    }`}
                  >
                    {isNegative ? "-" : "+"}${m.amount.toLocaleString("es-AR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
