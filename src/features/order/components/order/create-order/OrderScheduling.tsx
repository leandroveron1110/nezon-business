"use client";

import { CalendarClock, Clock3, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// ORDER SCHEDULING COMPONENT
// ============================================================================
function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

interface OrderSchedulingProps {
  scheduledAt: Date | null;
  onChange: (date: Date | null) => void;
}

export function OrderScheduling({ scheduledAt, onChange }: OrderSchedulingProps) {
  const [isScheduled, setIsScheduled] = useState(!!scheduledAt);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!scheduledAt) {
      setIsScheduled(false);
      setDate("");
      setTime("");
      return;
    }
    setIsScheduled(true);
    setDate(formatDateInput(scheduledAt));
    setTime(formatTimeInput(scheduledAt));
  }, [scheduledAt]);

  const handleToggle = (scheduled: boolean) => {
    setIsScheduled(scheduled);
    if (!scheduled) {
      setDate("");
      setTime("");
      onChange(null);
    } else if (!date || !time) {
      const now = new Date();
      const d = formatDateInput(now);
      const t = formatTimeInput(now);
      setDate(d);
      setTime(t);
      onChange(now);
    }
  };

  const updateSchedule = (newDate: string, newTime: string) => {
    if (!newDate || !newTime) return;
    const scheduledDate = new Date(`${newDate}T${newTime}`);
    if (!Number.isNaN(scheduledDate.getTime())) {
      onChange(scheduledDate);
    }
  };

  const today = formatDateInput(new Date());

  return (
    <div className="flex flex-col gap-1.5 p-1.5 bg-slate-50 border-b border-slate-200 text-[10px]">
      {/* Dynamic Segmented Switch */}
      <div className="grid grid-cols-2 gap-1 rounded-md bg-slate-200/60 p-0.5 font-bold">
        <button
          type="button"
          onClick={() => handleToggle(false)}
          className={`flex items-center justify-center gap-1.5 py-1 rounded transition-all ${
            !isScheduled
              ? "bg-white text-slate-800 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Zap size={12} className={!isScheduled ? "text-amber-500 fill-amber-500" : ""} />
          <span>AHORA</span>
        </button>

        <button
          type="button"
          onClick={() => handleToggle(true)}
          className={`flex items-center justify-center gap-1.5 py-1 rounded transition-all ${
            isScheduled
              ? "bg-white text-emerald-600 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CalendarClock size={12} />
          <span>PROGRAMAR</span>
        </button>
      </div>

      {/* Expanded Controls (Rendered only when active) */}
      {isScheduled && (
        <div className="flex items-center gap-1 mt-0.5">
          <div className="relative flex-1">
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                updateSchedule(e.target.value, time);
              }}
              className="w-full h-7 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="relative flex-1">
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                updateSchedule(date, e.target.value);
              }}
              className="w-full h-7 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
