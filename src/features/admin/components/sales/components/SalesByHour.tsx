import { formatCurrency } from "@/features/common/utils/sales";
import { BarChart3 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";

export default function SalesByHour({
  data,
}: {
  data: {
    hour: number;
    amount: number;
  }[];
}) {
  const max = Math.max(...data.map((item) => item.amount), 1);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <SectionHeader
        title="Ventas por horario"
        description="En qué horarios se concentra la venta."
        icon={BarChart3}
      />

      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const width = (item.amount / max) * 100;
              const nextHour = (item.hour + 1) % 24;

              return (
                <div key={item.hour}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">
                      {String(item.hour).padStart(2, "0")}:00 -{" "}
                      {String(nextHour).padStart(2, "0")}:00 hs
                    </span>

                    <span className="text-gray-500">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-700 transition-all"
                      style={{
                        width: `${Math.max(width, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}