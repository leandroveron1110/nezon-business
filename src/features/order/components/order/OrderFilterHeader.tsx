"use client";

import React from "react";
import { CalendarX } from "lucide-react";

interface Props {
  selectedDate: string | null;
  daysRange: number | null;
  onRangeChange: (days: number) => void;
  onDateChange: (date: string) => void;
}

export function OrderFilterHeader({
  selectedDate,
  daysRange,
  onRangeChange,
  onDateChange,
}: Props) {
  const quickOptions = [
    { label: "Hoy", value: 1 },
    { label: "48hs", value: 2 },
    { label: "Semana", value: 7 },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Filtro de Órdenes
        </span>

        {selectedDate && (
          <button
            onClick={() => onRangeChange(1)}
            className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1"
          >
            <CalendarX size={10} /> Limpiar
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
        {/* Quick filters */}
        <div className="flex gap-2">
          {quickOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRangeChange(opt.value)}
              className={`flex-none px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all
                ${
                  daysRange === opt.value && !selectedDate
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-2 flex-none" />

        {/* Input DATE directo */}
        <input
          type="date"
          value={selectedDate || ""}
          onChange={(e) => onDateChange(e.target.value)}
          className="flex-none px-4 py-2 rounded-xl text-[11px] font-bold border border-gray-200 bg-white text-gray-600 cursor-pointer"
        />
      </div>
    </div>
  );
}