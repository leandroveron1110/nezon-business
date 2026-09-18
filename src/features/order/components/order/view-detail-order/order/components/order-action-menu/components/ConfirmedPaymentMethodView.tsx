"use client";

import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";

interface ConfirmedPaymentMethodViewProps {
  isSaving: boolean;
  onBack: () => void;
  onConfirm: (authorizationCode: string) => void;
}

export function ConfirmedPaymentMethodView({
  isSaving,
  onBack,
  onConfirm,
}: ConfirmedPaymentMethodViewProps) {
  const [authorizationCode, setAuthorizationCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorizationCode.trim() || isSaving) return;

    onConfirm(authorizationCode.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      {/* HEADER */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <LockKeyhole size={15} />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-800">
              Autorización requerida
            </span>

            <span className="text-[9px] font-bold text-slate-400">
              El pedido ya fue cobrado
            </span>
          </div>
        </div>
      </div>

      {/* EXPLICACIÓN */}
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-[10px] leading-relaxed font-medium text-amber-800">
          Para cambiar el medio de pago de una orden ya cobrada se requiere un
          código de autorización.
        </p>
      </div>

      {/* INPUT */}
      <div className="mb-3">
        <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-slate-400">
          Código de autorización
        </label>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={authorizationCode}
          onChange={(e) => setAuthorizationCode(e.target.value)}
          placeholder="Ingresá el código"
          disabled={isSaving}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-50"
        />
      </div>

      {/* BOTONES */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!authorizationCode.trim() || isSaving}
          className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Verificando..." : "Autorizar cambio"}
        </button>
      </div>
    </form>
  );
}