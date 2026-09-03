"use client";

import {
  CheckCircle2,
  Package,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  IOption,
} from "@/features/catalog/types/catlog";

import {
  formatPrice,
} from "@/features/common/utils/formatPrice";

interface OptionItemProps {
  option: IOption;

  onDelete: (
    optionId: string,
  ) => void;
}

export default function OptionItem({
  option,
  onDelete,
}: OptionItemProps) {
  const price =
    Number(option.priceFinal);

  const isFree = price === 0;

  const isMenuProduct =
    !!option.menuProductId;

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm">
      {/* INFO */}

      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            option.hasStock
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {option.hasStock ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">
            {option.name}
          </p>

          <div className="mt-1 flex items-center gap-2">
            {isMenuProduct && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Package className="h-3 w-3" />

                Producto del menú
              </span>
            )}

            {!option.hasStock && (
              <span className="text-xs text-red-500">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ACCIONES */}

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`text-sm font-semibold ${
            isFree
              ? "text-emerald-600"
              : "text-slate-900"
          }`}
        >
          {isFree
            ? "Incluido"
            : `+ ${formatPrice(
                option.priceFinal,
              )}`}
        </span>

        <button
          type="button"
          onClick={() =>
            onDelete(option.id)
          }
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}