import { formatOrderType, formatPercentage } from "@/features/common/utils/sales";
import { ShoppingBag } from "lucide-react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";

export default function SalesByOrderType({
  data,
}: {
  data: {
    type: string;
    orderCount: number;
    percentage: number;
  }[];
}) {
  const max = Math.max(...data.map((item) => item.orderCount), 1);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <SectionHeader
        title="Pedidos por tipo"
        description="Cómo se distribuyen los pedidos realizados."
        icon={ShoppingBag}
      />

      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {data.map((item) => {
              const width = (item.orderCount / max) * 100;

              return (
                <div key={item.type}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="font-medium text-gray-800">
                      {formatOrderType(item.type)}
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {item.orderCount}
                      </span>

                      <span className="ml-1 text-xs text-gray-500">
                        pedidos
                      </span>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-800 transition-all"
                      style={{
                        width: `${Math.max(width, 2)}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {formatPercentage(item.percentage)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}