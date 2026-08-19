interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-2 truncate text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="ml-3 rounded-xl bg-gray-50 p-2.5">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
    </div>
  );
}