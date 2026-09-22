"use client";

export function TreasurySkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      {/* Skeleton del Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-slate-100" />
        </div>

        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Skeleton de la Posición Consolidada */}
      <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />

      {/* Skeleton de la Lista de Cuentas */}
      <div className="space-y-3">
        <div className="flex justify-between px-1">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}