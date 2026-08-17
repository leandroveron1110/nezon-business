"use client";

import { CalendarClock, Clock3, Zap, X } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderSchedulingProps {
  scheduledAt: Date | null;
  onChange: (date: Date | null) => void;
}

export default function OrderScheduling({
  scheduledAt,
  onChange,
}: OrderSchedulingProps) {
  const [isScheduled, setIsScheduled] = useState(!!scheduledAt);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // ------------------------------------------------------------
  // Inicializar desde scheduledAt
  // ------------------------------------------------------------

  useEffect(() => {
    if (!scheduledAt) {
      setIsScheduled(false);
      setDate("");
      setTime("");
      return;
    }

    setIsScheduled(true);

    const year = scheduledAt.getFullYear();
    const month = String(scheduledAt.getMonth() + 1).padStart(2, "0");
    const day = String(scheduledAt.getDate()).padStart(2, "0");

    const hours = String(scheduledAt.getHours()).padStart(2, "0");
    const minutes = String(scheduledAt.getMinutes()).padStart(2, "0");

    setDate(`${year}-${month}-${day}`);
    setTime(`${hours}:${minutes}`);
  }, [scheduledAt]);

  // ------------------------------------------------------------
  // Seleccionar pedido inmediato
  // ------------------------------------------------------------

  const handleImmediate = () => {
    setIsScheduled(false);
    setDate("");
    setTime("");
    onChange(null);
  };

  // ------------------------------------------------------------
  // Seleccionar pedido programado
  // ------------------------------------------------------------

  const handleScheduled = () => {
    setIsScheduled(true);

    // Si todavía no hay fecha/hora, dejamos que el usuario las elija.
    // No modificamos scheduledAt hasta que haya una selección válida.
  };

  // ------------------------------------------------------------
  // Cambiar fecha
  // ------------------------------------------------------------

  const handleDateChange = (value: string) => {
    setDate(value);

    if (!value || !time) return;

    const scheduledDate = new Date(`${value}T${time}`);

    if (!Number.isNaN(scheduledDate.getTime())) {
      onChange(scheduledDate);
    }
  };

  // ------------------------------------------------------------
  // Cambiar hora
  // ------------------------------------------------------------

  const handleTimeChange = (value: string) => {
    setTime(value);

    if (!date || !value) return;

    const scheduledDate = new Date(`${date}T${value}`);

    if (!Number.isNaN(scheduledDate.getTime())) {
      onChange(scheduledDate);
    }
  };

  // ------------------------------------------------------------
  // Fecha mínima = hoy
  // ------------------------------------------------------------

  const today = new Date();

  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <div className="space-y-2">
      {/* ======================================================
          SELECTOR PRINCIPAL
          ====================================================== */}

      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={handleImmediate}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-black uppercase tracking-wide transition-all ${
            !isScheduled
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:bg-white/70"
          }`}
        >
          <Zap size={14} />
          Ahora
        </button>

        <button
          type="button"
          onClick={handleScheduled}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-black uppercase tracking-wide transition-all ${
            isScheduled
              ? "bg-white text-emerald-600 shadow-sm"
              : "text-slate-500 hover:bg-white/70"
          }`}
        >
          <CalendarClock size={14} />
          Programar
        </button>
      </div>

      {/* ======================================================
          CONFIGURACIÓN DEL PEDIDO PROGRAMADO
          ====================================================== */}

      {isScheduled && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            {/* Fecha */}

            <label className="block">
              <span className="mb-1 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                Fecha
              </span>

              <div className="relative">
                <CalendarClock
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-xs font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </label>

            {/* Hora */}

            <label className="block">
              <span className="mb-1 block text-[9px] font-black uppercase tracking-wide text-slate-500">
                Hora
              </span>

              <div className="relative">
                <Clock3
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-xs font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </label>
          </div>

          {/* Aviso si todavía no está completo */}

          {isScheduled && (!date || !time) && (
            <p className="mt-2 text-[9px] font-bold text-amber-600">
              Seleccioná fecha y hora para programar el pedido.
            </p>
          )}

          {/* Confirmación visual */}

          {scheduledAt && date && time && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <Clock3 size={13} className="text-emerald-600" />

              <span className="text-[10px] font-black text-slate-700">
                Programado para{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(scheduledAt)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}