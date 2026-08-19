import { formatCurrency, formatPercentage } from "@/features/common/utils/sales";
import { Store } from "lucide-react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";

export default function CashRegisters({
  data,
}: {
  data: {
    cashRegisterId: string;
    cashRegisterName: string;
    amount: number;
    percentage: number;
  }[];
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <SectionHeader
        title="Ventas por caja"
        description="Volumen vendido en cada caja."
        icon={Store}
      />

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="divide-y divide-gray-100">
          {data.map((item) => (
            <div key={item.cashRegisterId} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className="truncate font-medium text-gray-900"
                    title={item.cashRegisterName}
                  >
                    {item.cashRegisterName}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatPercentage(item.percentage)}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-gray-900">
                  {formatCurrency(item.amount)}
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all"
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}