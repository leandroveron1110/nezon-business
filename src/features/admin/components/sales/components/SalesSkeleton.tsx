export default function SalesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>

      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
