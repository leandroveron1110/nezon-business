"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, FileText, Pencil } from "lucide-react";

interface KitchenNoteProps {
  notes: string;
  onChangeNotes: (notes: string) => void;
}

export function KitchenNote({ notes, onChangeNotes }: KitchenNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasNotes = Boolean(notes.trim());

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
      <button
        type="button"
        onClick={() => setIsExpanded((curr) => !curr)}
        className="flex w-full items-center justify-between p-2.5 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
              hasNotes
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {hasNotes ? <Check size={12} strokeWidth={3} /> : <FileText size={12} />}
          </div>

          <div className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
              Nota de cocina
            </span>
            {!isExpanded && hasNotes && (
              <span className="block truncate text-[9px] font-bold text-emerald-700">
                {notes}
              </span>
            )}
          </div>
        </div>

        {isExpanded ? (
          <ChevronDown size={15} className="text-slate-400" />
        ) : hasNotes ? (
          <Pencil size={13} className="text-slate-400" />
        ) : (
          <ChevronRight size={15} className="text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 p-2.5">
          <input
            autoFocus
            type="text"
            placeholder="Ej: Poca sal, salsa aparte..."
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-bold text-slate-800 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
          />
        </div>
      )}
    </div>
  );
}