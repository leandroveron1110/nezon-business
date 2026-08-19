import {
  formatCompactCurrency,
  formatShortDate,
} from "@/features/common/utils/sales";
import SectionHeader from "./SectionHeader";
import { BarChart3 } from "lucide-react";
import EmptyState from "./EmptyState";

export default function SalesEvolution({
  data,
}: {
  data: {
    date: string;
    amount: number;
  }[];
}) {
  const max = Math.max(...data.map((item) => item.amount), 1);
  const isSingleItem = data.length === 1;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <SectionHeader
        title="Evolución de ventas"
        description="Volumen vendido durante el período seleccionado."
        icon={BarChart3}
      />

      <div className="p-5">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className={`flex h-72 items-end gap-3 overflow-x-auto pb-2 ${
              isSingleItem ? "justify-center" : "justify-start md:justify-around"
            }`}
          >
            {data.map((item) => {
              const height = (item.amount / max) * 100;

              return (
                <div
                  key={item.date}
                  className="flex h-full w-12 shrink-0 flex-col items-center justify-end gap-2"
                >
                  {/* Monto comprimido arriba de la barra */}
                  <span className="text-[10px] font-medium text-gray-500">
                    {formatCompactCurrency(item.amount)}
                  </span>

                  {/* Contenedor de la barra con altura fija */}
                  <div className="flex h-52 w-full justify-center items-end rounded-t-lg bg-gray-50">
                    <div
                      className="w-8 rounded-t-md bg-gray-900 transition-all hover:bg-gray-700"
                      style={{
                        height: `${Math.max(height, 4)}%`,
                      }}
                      title={`${formatShortDate(item.date)}: $${item.amount.toLocaleString()}`}
                    />
                  </div>

                  {/* Fecha abajo */}
                  <span className="text-[10px] font-medium text-gray-400">
                    {formatShortDate(item.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}