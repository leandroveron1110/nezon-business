import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface ComparisonCardProps {
  title: string;
  comparison: {
    current: number;
    previous: number;
    variation: number;
    variationPercentage: number;
  };
}

export default function ComparisonCard({
  title,
  comparison,
}: ComparisonCardProps) {
  const isPositive = comparison.variation >= 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {title}
      </span>
      <div className="flex items-baseline justify-between mt-2">
        <span className="text-2xl font-extrabold text-slate-800">
          ${comparison.current.toLocaleString("es-AR")}
        </span>
        <div
          className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
          )}
          {Math.abs(comparison.variationPercentage).toFixed(1)}%
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-1">
        Período anterior: ${comparison.previous.toLocaleString("es-AR")}
      </span>
    </div>
  );
}
