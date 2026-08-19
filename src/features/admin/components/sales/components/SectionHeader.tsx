export default function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 p-5">
      <div className="rounded-xl bg-gray-50 p-2">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>

      <div className="min-w-0">
        <h2 className="font-semibold text-gray-900">{title}</h2>

        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
