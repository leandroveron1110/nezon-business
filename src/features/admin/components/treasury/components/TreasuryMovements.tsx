"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Wallet,
  Clock,
  FileText,
} from "lucide-react";

import { FinancialMovementType } from "@/mini-back/shared/enums/financial-movement-status.enum";

export interface TreasuryMovement {
  idTemp: string;
  type: FinancialMovementType;
  amount: number;
  description: string;
  notes?: string | null;
  treasuryAccountName: string;
  createdAt: string | Date;
}

interface TreasuryMovementsProps {
  movements: TreasuryMovement[];
  isLoading?: boolean;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string | Date) {
  const value = new Date(date);

  return {
    date: value.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: value.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getMovementConfig(type: FinancialMovementType) {
  switch (type) {
    // ---------------------------------------------------------
    // INGRESO
    // ---------------------------------------------------------

    case FinancialMovementType.INCOME:
      return {
        icon: ArrowDownLeft,
        label: "Ingreso",
        container: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        amount: "text-emerald-700",
        sign: "+",
      };

    // ---------------------------------------------------------
    // EGRESO
    // ---------------------------------------------------------

    case FinancialMovementType.EXPENSE:
      return {
        icon: ArrowUpRight,
        label: "Egreso",
        container: "bg-rose-50 text-rose-700 ring-rose-600/10",
        amount: "text-rose-700",
        sign: "-",
      };

    // ---------------------------------------------------------
    // TRANSFERENCIA SALIENTE
    // ---------------------------------------------------------

    case FinancialMovementType.INTERNAL_TRANSFER_OUT:
      return {
        icon: ArrowUpRight,
        label: "Transferencia enviada",
        container: "bg-amber-50 text-amber-700 ring-amber-600/10",
        amount: "text-amber-700",
        sign: "-",
      };

    // ---------------------------------------------------------
    // TRANSFERENCIA ENTRANTE
    // ---------------------------------------------------------

    case FinancialMovementType.INTERNAL_TRANSFER_IN:
      return {
        icon: ArrowDownLeft,
        label: "Transferencia recibida",
        container: "bg-sky-50 text-sky-700 ring-sky-600/10",
        amount: "text-sky-700",
        sign: "+",
      };

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------

    default:
      return {
        icon: ArrowRightLeft,
        label: "Movimiento",
        container: "bg-slate-100 text-slate-600 ring-slate-600/10",
        amount: "text-slate-700",
        sign: "",
      };
  }
}

export function TreasuryMovements({
  movements,
  isLoading = false,
}: TreasuryMovementsProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
      {/* ----------------------------------------------------- */}
      {/* HEADER */}
      {/* ----------------------------------------------------- */}

      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              Movimientos de Tesorería
            </h2>

            {!isLoading && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {movements.length}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Historial de ingresos, egresos y transferencias.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* LOADING */}
      {/* ----------------------------------------------------- */}

      {isLoading && (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 px-6 py-4">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />

                <div className="h-2.5 w-28 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* EMPTY */}
      {/* ----------------------------------------------------- */}

      {!isLoading && movements.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Wallet className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-700">
            No hay movimientos todavía
          </h3>

          <p className="mt-1 max-w-sm text-xs font-medium leading-5 text-slate-400">
            Los ingresos, egresos y transferencias que registres aparecerán acá.
          </p>
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* MOVEMENTS */}
      {/* ----------------------------------------------------- */}

      {!isLoading && movements.length > 0 && (
        <div className="divide-y divide-slate-100">
          {movements.map((movement) => {
            const config = getMovementConfig(movement.type);

            const Icon = config.icon;

            const formattedDate = formatDate(movement.createdAt);

            return (
              <div
                key={movement.idTemp}
                className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50/70"
              >
                {/* ------------------------------------------------- */}
                {/* ICON */}
                {/* ------------------------------------------------- */}

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${config.container}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                {/* ------------------------------------------------- */}
                {/* INFORMATION */}
                {/* ------------------------------------------------- */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-slate-700">
                      {movement.description}
                    </p>

                    <span
                      className={`hidden rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:inline-flex ${config.container}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-400">
                    {/* Cuenta */}

                    <span className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />

                      {movement.treasuryAccountName}
                    </span>

                    {/* Fecha */}

                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formattedDate.date} · {formattedDate.time}
                    </span>

                    {/* Notas */}

                    {movement.notes && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Con nota
                      </span>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* AMOUNT */}
                {/* ------------------------------------------------- */}

                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-bold tracking-tight ${config.amount}`}
                  >
                    {config.sign} ${formatCurrency(movement.amount)}
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {config.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
