import React from "react";
import { Bike, Check, Loader2 } from "lucide-react";
import { MenuHeader } from "./MenuHeader";

interface CourierViewProps {
  courierName: string;
  isSaving: boolean;
  onBack: () => void;
  onCourierNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CourierView({
  courierName,
  isSaving,
  onBack,
  onCourierNameChange,
  onSubmit,
}: CourierViewProps) {
  return (
    <>
      <MenuHeader
        title="Asignar cadete"
        icon={<Bike size={15} className="text-amber-600" />}
        onBack={onBack}
      />
      <form onSubmit={onSubmit} className="space-y-2 bg-amber-50/60 p-3">
        <div className="text-[10px] font-bold uppercase text-amber-800">Nombre / ID del Cadete</div>
        <div className="flex gap-1">
          <input
            type="text"
            autoFocus
            disabled={isSaving}
            placeholder="Ej: Juan / Cadete 2"
            value={courierName}
            onChange={(e) => onCourierNameChange(e.target.value)}
            className="min-w-0 flex-1 rounded border border-amber-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-w-[30px] items-center justify-center rounded bg-amber-600 p-1.5 text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            title="Guardar"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
        </div>
      </form>
    </>
  );
}