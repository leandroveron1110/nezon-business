"use client";

interface TreasurySummaryProps {
  balancesByCurrency: Record<string, number>;
  activeAccountsCount: number;
  totalAccountsCount: number;
}

export function TreasurySummary({
  balancesByCurrency,
  activeAccountsCount,
  totalAccountsCount,
}: TreasurySummaryProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasBalances = Object.entries(balancesByCurrency).length > 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Posición Consolidada
          </span>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {hasBalances ? (
              Object.entries(balancesByCurrency).map(([currency, balance]) => (
                <div key={currency} className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {formatCurrency(balance, currency)}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(0, "ARS")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500">Cuentas activas</span>
            <p className="text-lg font-bold text-slate-900">
              {activeAccountsCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {totalAccountsCount}
              </span>
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="space-y-0.5">
            <span className="text-xs text-slate-500">Estado global</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Operativo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}