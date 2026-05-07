"use client";

import { IOrderShortDto } from "@/types/order";
import { ISimplifiedFilter } from "@/features/common/utils/filtersData";

interface OrdersFiltersProps {
  quickFilters: ISimplifiedFilter[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  orders: IOrderShortDto[];
}

export default function OrdersFilters({
  quickFilters,
  activeFilter,
  setActiveFilter,
  orders = [],
}: OrdersFiltersProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide lg:overflow-x-visible lg:flex-wrap">
      {quickFilters.map((filter) => {
        // Ahora el conteo es 100% basado en la condición de hilos
        const count = orders.filter((o) => filter.condition(o)).length;

        return (
          <FilterButton
            key={filter.label}
            label={filter.label}
            count={count}
            active={activeFilter === filter.label}
            onClick={() => setActiveFilter(filter.label)}
          />
        );
      })}
    </div>
  );
}

// ... FilterButton se mantiene igual (su lógica visual está perfecta) ...

interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
        transition-colors duration-200 ease-in-out
        ${active
          ? "bg-blue-600 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      `}
    >
      {label}
      <span className={`
        px-2 py-0.5 text-xs font-semibold rounded-full
        ${active
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-600"
        }
      `}>
        {count}
      </span>
    </button>
  );
}
