interface KpiMiniCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color:
    | "blue"
    | "indigo"
    | "violet"
    | "emerald"
    | "amber"
    | "rose"
    | "red"
    | "teal";
}

export default function KpiMiniCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: KpiMiniCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-slate-400 truncate">
          {title}
        </span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800 truncate">{value}</div>
        {subtitle && (
          <div className="text-[10px] text-slate-400 mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
