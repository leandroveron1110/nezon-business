// @/features/cash-register/ui/CashRegisterStatusBadge.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useCashRegisterStatus } from "../hooks/useCashRegisterStatus";

interface Props {
  businessId: string;
  onOpenRegisterClick: () => void;
  onGoToCashPageClick: () => void;
}

export function CashRegisterStatusBadge({
  businessId,
  onOpenRegisterClick,
  onGoToCashPageClick,
}: Props) {
  const { isOpen, isLoading } = useCashRegisterStatus(businessId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Verificando caja...</span>
      </div>
    );
  }

  if (isOpen) {
    return (
      <button
        type="button"
        onClick={onGoToCashPageClick}
        title="Ir a Caja"
        className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs transition hover:bg-emerald-100"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

        <span className="font-medium text-slate-700">
          Caja
        </span>

        <span className="font-semibold text-emerald-700">
          Abierta
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenRegisterClick}
      title="Abrir caja"
      className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs transition hover:bg-amber-100"
    >
      <span className="h-2 w-2 rounded-full bg-amber-500" />

      <span className="font-semibold text-amber-800">
        Abrir caja
      </span>
    </button>
  );
}