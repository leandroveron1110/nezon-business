"use client";

import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";
import type { InventoryLocationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-location.model";
import type { InventoryStockModel } from "@/mini-back/core/inventory-core/domain/models/inventory-stock.model";
import type { InventoryLotModel } from "@/mini-back/core/inventory-core/domain/models/inventory-lot.model";

interface StockTableProps {
  stock: InventoryStockModel[];
  products: InventoryProductModel[];
  locations: InventoryLocationModel[];
  lots: InventoryLotModel[];
  onOpenAdjust?: (stockItem: InventoryStockModel) => void;
  onOpenConsume?: (stockItem: InventoryStockModel) => void;
  onOpenReceive?: (stockItem: InventoryStockModel) => void;
}

export default function StockTable({
  stock,
  products,
  locations,
  lots,
  onOpenAdjust,
  onOpenConsume,
  onOpenReceive,
}: StockTableProps) {
  const productMap = new Map(products.map((p) => [p.idTemp, p]));
  const locationMap = new Map(locations.map((l) => [l.idTemp, l]));
  const lotMap = new Map(lots.map((l) => [l.idTemp, l]));

  if (stock.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-slate-800">
          📦
        </div>

        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Sin registros de inventario
        </h3>

        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
          No hay existencias registradas para la selección actual.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
            <tr>
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Producto
              </th>

              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Ubicación
              </th>

              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Lote
              </th>

              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Existencia
              </th>

              <th className="w-[260px] px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Operaciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stock.map((item) => {
              const product = productMap.get(item.inventoryProductIdTemp);
              const location = locationMap.get(item.locationIdTemp);
              const lot = item.lotIdTemp
                ? lotMap.get(item.lotIdTemp)
                : null;

              const quantity = item.quantityBase;
              const isEmpty = quantity <= 0;

              return (
                <tr
                  key={item.idTemp}
                  className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  {/* PRODUCTO */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">
                        📦
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {product?.name ?? item.inventoryProductIdTemp}
                        </div>

                        {product?.code && (
                          <div className="mt-0.5 text-[11px] text-slate-400">
                            {product.code}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* UBICACIÓN */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-xs text-slate-400">⌖</span>

                      <span>
                        {location?.name ?? item.locationIdTemp}
                      </span>
                    </div>
                  </td>

                  {/* LOTE */}
                  <td className="px-5 py-4">
                    {lot ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {lot.lotNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">
                        Sin lote
                      </span>
                    )}
                  </td>

                  {/* STOCK */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={[
                          "text-base font-bold tabular-nums",
                          isEmpty
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-900 dark:text-slate-100",
                        ].join(" ")}
                      >
                        {quantity}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        base
                      </span>
                    </div>

                    {isEmpty && (
                      <div className="mt-1 text-right text-[10px] font-medium text-rose-500">
                        Sin existencia
                      </div>
                    )}
                  </td>

                  {/* ACCIONES */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {onOpenReceive && (
                        <button
                          type="button"
                          onClick={() => onOpenReceive(item)}
                          title="Registrar ingreso"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
                        >
                          <span className="text-sm leading-none">+</span>
                          Ingreso
                        </button>
                      )}

                      {onOpenConsume && (
                        <button
                          type="button"
                          onClick={() => onOpenConsume(item)}
                          title="Registrar consumo"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60"
                        >
                          <span className="text-sm leading-none">−</span>
                          Consumo
                        </button>
                      )}

                      {onOpenAdjust && (
                        <button
                          type="button"
                          onClick={() => onOpenAdjust(item)}
                          title="Ajustar existencia"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <span className="text-sm leading-none">↕</span>
                          Ajustar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}