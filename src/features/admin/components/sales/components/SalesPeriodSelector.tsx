import { SalesPeriod } from "@/features/common/utils/sales";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";

interface SalesPeriodSelectorProps {
  value: SalesPeriod;
  onChange: (value: SalesPeriod) => void;
  customRange: { from: Date; to: Date };
  onCustomRangeChange: (range: { from: Date; to: Date }) => void;
}
export default function SalesPeriodSelector({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
}: SalesPeriodSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auxiliar para formatear objeto Date a string tipo YYYY-MM-DD para <input type="date">
  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [tempFrom, setTempFrom] = useState(() =>
    formatDateForInput(customRange.from),
  );
  const [tempTo, setTempTo] = useState(() =>
    formatDateForInput(customRange.to),
  );

  const options: {
    value: SalesPeriod;
    label: string;
  }[] = [
    { value: "today", label: "Hoy" },
    { value: "yesterday", label: "Ayer" },
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
  ];

  const handleApplyCustom = () => {
    if (!tempFrom || !tempTo) return;

    const [fYear, fMonth, fDay] = tempFrom.split("-").map(Number);
    const [tYear, tMonth, tDay] = tempTo.split("-").map(Number);

    const fromDate = new Date(fYear, fMonth - 1, fDay, 0, 0, 0, 0);
    const toDate = new Date(tYear, tMonth - 1, tDay, 23, 59, 59, 999);

    onCustomRangeChange({ from: fromDate, to: toDate });
    onChange("custom");
    setIsModalOpen(false);
  };

  const isCustomActive = value === "custom";

  return (
    <>
      <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 md:w-auto">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                whitespace-nowrap rounded-lg px-3 py-2 text-sm
                font-medium transition
                ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              {option.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setTempFrom(formatDateForInput(customRange.from));
            setTempTo(formatDateForInput(customRange.to));
            setIsModalOpen(true);
          }}
          className={`
            flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition
            ${
              isCustomActive
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <CalendarDays className="h-4 w-4" />
          <span>{isCustomActive ? "Personalizado ✓" : "Personalizado"}</span>
        </button>
      </div>

      {/* Modal para selección de rango personalizado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">
              Seleccionar Rango
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Elegí las fechas de inicio y fin para filtrar las ventas.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Desde
                </label>
                <input
                  type="date"
                  value={tempFrom}
                  onChange={(e) => setTempFrom(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Hasta
                </label>
                <input
                  type="date"
                  value={tempTo}
                  onChange={(e) => setTempTo(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
