"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/mini-back/infrastructure/dexie/db";
import { 
  Eye, 
  Receipt, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  RefreshCw, 
  X, 
  Clock, 
  Calendar, 
  FileText,
  DollarSign,
  Scale
} from "lucide-react";
import { LocalCashRegisterTurn } from "@/mini-back/infrastructure/dexie/shcema/cash-register-turn.schema";

interface Props {
  businessId: string;
}

export default function HistoryCashRegisterPage({ businessId }: Props) {
  const [turns, setTurns] = useState<LocalCashRegisterTurn[]>([]);
  const [selectedTurn, setSelectedTurn] = useState<LocalCashRegisterTurn | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar turnos cerrados usando el índice optimizado [businessId+status]
  useEffect(() => {
    async function loadHistory() {
      try {
        const closedTurns = await db.cashRegisterTurn
          .where("[businessId+status]")
          .equals([businessId, "CLOSED"])
          .reverse()
          .sortBy("closingDate");
          
        setTurns(closedTurns);
      } catch (error) {
        console.error("Error al obtener historial de cierres:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (businessId) loadHistory();
  }, [businessId]);

  // Cálculos acumulados globales para el pie de tabla y métricas
  const globalTotals = useMemo(() => {
    return turns.reduce(
      (acc, t) => {
        const declared = t.declaredClosingAmount ?? 0;
        const system = t.systemClosingAmount ?? t.openingAmount;
        const diff = t.difference ?? (declared - system);
        const cashGenerated = declared - t.openingAmount; // Venta/Neto en efectivo generado

        acc.totalDeclared += declared;
        acc.totalOpening += t.openingAmount;
        acc.totalNetCash += cashGenerated;
        acc.totalDiff += diff;
        return acc;
      },
      { totalDeclared: 0, totalOpening: 0, totalNetCash: 0, totalDiff: 0 }
    );
  }, [turns]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
        <span className="text-xs font-medium">Cargando cierres anteriores...</span>
      </div>
    );
  }

  if (turns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
        <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
          <Receipt className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-bold text-slate-800 text-sm">Sin cierres registrados</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Aún no hay turnos cerrados en este comercio. Cuando cierres un turno de caja aparecerá en esta lista.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TARJETAS RESUMEN DE HISTORIAL */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Turnos Cerrados</span>
            <Receipt className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{turns.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Neto Efec. Generado</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            ${globalTotals.totalNetCash.toLocaleString("es-AR")}
          </p>
          <span className="text-[10px] text-slate-400">Total recaudado sin aperturas</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Balance Descuadres</span>
            <Scale className="h-4 w-4 text-slate-400" />
          </div>
          <p className={`mt-2 text-2xl font-black ${
            globalTotals.totalDiff === 0 
              ? "text-slate-900" 
              : globalTotals.totalDiff > 0 
              ? "text-blue-600" 
              : "text-rose-600"
          }`}>
            {globalTotals.totalDiff > 0 ? "+" : ""}
            ${globalTotals.totalDiff.toLocaleString("es-AR")}
          </p>
          <span className="text-[10px] text-slate-400">Suma total de faltantes/sobrantes</span>
        </div>
      </div>

      {/* TABLA DE CIERRES */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-semibold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">ID Turno</th>
                <th className="px-5 py-3.5">Apertura / Cierre</th>
                <th className="px-5 py-3.5 text-right">Monto Inicial</th>
                <th className="px-5 py-3.5 text-right">Esperado (Sistema)</th>
                <th className="px-5 py-3.5 text-right">Declarado (Cajón)</th>
                <th className="px-5 py-3.5 text-center">Arqueo</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {turns.map((turn) => {
                const declared = turn.declaredClosingAmount ?? 0;
                const system = turn.systemClosingAmount ?? turn.openingAmount;
                const diff = turn.difference ?? (declared - system);
                const isExact = diff === 0;

                return (
                  <tr key={turn.clientTurnId} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      #{turn.clientTurnId.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-slate-600 space-y-0.5">
                      <div className="font-medium text-slate-800">
                        {new Date(turn.openingDate).toLocaleString("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cierre: {turn.closingDate
                          ? new Date(turn.closingDate).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-500">
                      ${turn.openingAmount.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-700">
                      ${system.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">
                      ${declared.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          isExact
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : diff > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isExact ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : diff > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {isExact
                          ? "Exacto"
                          : diff > 0
                          ? `+$${diff.toLocaleString("es-AR")}`
                          : `-$${Math.abs(diff).toLocaleString("es-AR")}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTurn(turn)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition active:scale-95"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* PIE DE TABLA: TOTALES ACUMULADOS DE LA PÁGINA */}
            <tfoot className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-800">
              <tr>
                <td colSpan={2} className="px-5 py-3.5 text-xs">
                  TOTALES ACUMULADOS
                </td>
                <td className="px-5 py-3.5 text-right">
                  ${globalTotals.totalOpening.toLocaleString("es-AR")}
                </td>
                <td className="px-5 py-3.5 text-right text-slate-500">
                  --
                </td>
                <td className="px-5 py-3.5 text-right text-slate-900">
                  ${globalTotals.totalDeclared.toLocaleString("es-AR")}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`text-[11px] ${
                    globalTotals.totalDiff >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}>
                    {globalTotals.totalDiff > 0 ? "+" : ""}
                    ${globalTotals.totalDiff.toLocaleString("es-AR")}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL / DRAWER DE RESUMEN DE TURNO */}
      {selectedTurn && (
        <TurnDetailModal
          turn={selectedTurn}
          onClose={() => setSelectedTurn(null)}
        />
      )}
    </div>
  );
}

{/* MODAL INTERNO DE DETALLE RÁPIDO */}
function TurnDetailModal({
  turn,
  onClose,
}: {
  turn: LocalCashRegisterTurn;
  onClose: () => void;
}) {
  const openingAmount = turn.openingAmount || 0;
  const declaredAmount = turn.declaredClosingAmount ?? 0;
  const systemAmount = turn.systemClosingAmount ?? openingAmount;
  const difference = turn.difference ?? (declaredAmount - systemAmount);

  const isExact = difference === 0;
  const isSurplus = difference > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Resumen de Arqueo
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Turno #{turn.clientTurnId.slice(-6).toUpperCase()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div
            className={`flex items-center justify-between rounded-2xl p-4 border ${
              isExact
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : isSurplus
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {isExact ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : isSurplus ? (
                <TrendingUp className="h-5 w-5 text-blue-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600" />
              )}
              <div>
                <p className="font-bold text-xs">
                  {isExact
                    ? "Sin Diferencias"
                    : isSurplus
                    ? "Sobrante de Caja"
                    : "Faltante de Caja"}
                </p>
                <p className="text-[11px] opacity-80">
                  {isExact
                    ? "El efectivo declarado coincide perfectamente con el sistema."
                    : `$${Math.abs(difference).toLocaleString("es-AR")} de diferencia con el monto esperado por sistema.`}
                </p>
              </div>
            </div>

            {!isExact && (
              <span className="font-mono font-black text-sm">
                {isSurplus ? "+" : "-"}${Math.abs(difference).toLocaleString("es-AR")}
              </span>
            )}
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold">Apertura</p>
                <p className="font-semibold text-slate-700">
                  {new Date(turn.openingDate).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold">Cierre</p>
                <p className="font-semibold text-slate-700">
                  {turn.closingDate
                    ? new Date(turn.closingDate).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Comparativa de Montos */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] font-semibold text-slate-400">Monto Inicial</span>
              <p className="mt-0.5 font-bold text-slate-800 text-xs">
                ${openingAmount.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] font-semibold text-slate-400">Esperado Sistema</span>
              <p className="mt-0.5 font-bold text-slate-800 text-xs">
                ${systemAmount.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3">
              <span className="text-[10px] font-semibold text-slate-600">Declarado Cajón</span>
              <p className="mt-0.5 font-extrabold text-slate-900 text-sm">
                ${declaredAmount.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Notas de Cierre */}
          {turn.closingNotes && (
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1 font-bold text-amber-800 text-[11px]">
                <FileText className="h-3.5 w-3.5" />
                Notas de Cierre
              </div>
              <p className="text-amber-900/80 text-[11px] leading-relaxed">
                {turn.closingNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-xs text-white hover:bg-slate-800 transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}