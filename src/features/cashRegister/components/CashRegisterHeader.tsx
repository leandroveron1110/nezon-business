"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Wallet,
  Clock,
  Sparkles,
} from "lucide-react";

interface ActiveTurnInfo {
  openingDate?: string | Date;
  createdAt?: string | Date;
}

interface CashRegisterHeaderProps {
  initialCash: number;
  activeTurn: ActiveTurnInfo;
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenCloseTurnModal: () => void;
}

export function CashRegisterHeader({
  initialCash,
  activeTurn,
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenCloseTurnModal,
}: CashRegisterHeaderProps) {
  // Formateo de fecha y hora de apertura
  const rawDate = activeTurn.openingDate || activeTurn.createdAt;
  const openedAt = rawDate ? new Date(rawDate) : new Date();

  const formattedDate = openedAt.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const formattedTime = openedAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Lado Izquierdo: Información del Turno & Fondo Inicial */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {/* Badge del Turno Activo */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Caja Abierta
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Iniciado {formattedDate} a las {formattedTime} hs
                </span>
              </div>
            </div>
          </div>

          <div className="hidden h-10 w-px bg-slate-200 sm:block" />

          {/* Caja / Fondo Inicial */}
          <div>
            <span className="text-xs font-medium text-slate-400">
              Fondo Base Inicial
            </span>
            <p className="text-xl font-bold tracking-tight text-slate-800">
              ${initialCash.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Acciones Principales */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Agregar Dinero (Ingreso) */}
          <button
            type="button"
            onClick={onOpenIncomeModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95 border border-emerald-200/60"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            <span>Ingresar Dinero</span>
          </button>

          {/* Sacar Dinero (Egreso / Retiro) */}
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 border border-rose-200/60"
          >
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
            <span>Sacar Dinero</span>
          </button>

          {/* Cerrar Caja */}
          <button
            type="button"
            onClick={onOpenCloseTurnModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95"
          >
            <Lock className="h-4 w-4 text-slate-300" />
            <span>Cerrar Turno</span>
          </button>
        </div>
      </div>
    </header>
  );
}