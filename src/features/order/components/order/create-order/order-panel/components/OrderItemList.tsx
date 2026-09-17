"use client";

import { useState } from "react";
import { Store, Trash2, Minus, Plus, FileText } from "lucide-react";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { LocalOrderItem } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";

interface OrderItemListProps {
  items: LocalOrderItem[];
  updateQty: (index: number, delta: number) => void;
  updateItemNote: (index: number, note: string) => void;
}

export function OrderItemList({
  items,
  updateQty,
  updateItemNote,
}: OrderItemListProps) {
  const [openNoteIndex, setOpenNoteIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-white z-10 flex flex-col items-center justify-center text-slate-300 opacity-40 py-20 select-none">
        <Store className="w-8 h-8 mb-1" />
        <p className="text-[9px] font-black uppercase tracking-tighter">
          Esperando pedido...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white z-10 divide-y divide-slate-100">
      {items.map((item, i) => {
        const isNoteOpen = openNoteIndex === i;
        const hasNote = Boolean(item.notes);
        const hasOptionGroups =
          item.optionGroups && item.optionGroups.length > 0;

        return (
          <div
            key={i}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setOpenNoteIndex(isNoteOpen ? null : i);
              }
            }}
            className={`px-2.5 py-1.5 flex flex-col transition-colors cursor-pointer select-none ${
              isNoteOpen
                ? "bg-amber-50/80 border-l-2 border-orange-500"
                : hasNote
                  ? "bg-amber-50/30 hover:bg-amber-50/60"
                  : "hover:bg-slate-50/80"
            }`}
            title="Ctrl + Click para agregar nota de cocina"
          >
            {/* FILA PRINCIPAL */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase truncate leading-tight text-slate-800">
                  {item.productName}
                </p>
                <p className="text-[9px] text-blue-600 font-bold leading-tight">
                  {formatPrice(item.priceAtPurchase)}{" "}
                  <span className="text-slate-400 font-normal">x unid.</span>
                </p>
              </div>

              {/* CONTROLES CANTIDAD */}
              <div
                className="flex items-center bg-slate-100 rounded-md p-0.5 border shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => updateQty(i, -1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white active:bg-slate-200 rounded transition-colors"
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={12} className="text-red-500" />
                  ) : (
                    <Minus size={12} className="text-slate-600" />
                  )}
                </button>

                <span className="text-[10px] font-black w-5 text-center text-slate-800">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => updateQty(i, 1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white active:bg-slate-200 rounded transition-colors text-slate-600"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* BOTÓN NOTA */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenNoteIndex(isNoteOpen ? null : i);
                }}
                className={`w-6 h-6 flex items-center justify-center rounded shrink-0 transition-colors ${
                  hasNote
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    : "hover:bg-slate-200 text-slate-400"
                }`}
                title="Agregar nota (o usá Ctrl + Click)"
              >
                <FileText size={12} />
              </button>
            </div>

            {/* OPCIONES DEL PRODUCTO */}
            {hasOptionGroups && (
              <div className="mt-1 flex flex-wrap gap-1 pl-0.5">
                {item.optionGroups.map((group, groupIdx) =>
                  group.options.map((opt, optIdx) => (
                    <span
                      key={`${groupIdx}-${optIdx}`}
                      className="inline-flex items-center text-[8.5px] font-medium bg-slate-100/90 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/60 leading-tight"
                    >
                      <span className="font-bold text-slate-700 mr-1">
                        {group.groupName}:
                      </span>
                      <span>
                        {opt.quantity > 1 ? `${opt.quantity}x ` : ""}
                        {opt.optionName}
                      </span>
                      {opt.priceFinal > 0 && (
                        <span className="text-blue-600 font-semibold ml-1">
                          (+{formatPrice(opt.priceFinal)})
                        </span>
                      )}
                    </span>
                  )),
                )}
              </div>
            )}

            {/* EDITOR DE NOTA */}
            {isNoteOpen && (
              <div
                className="flex flex-col gap-1 mt-1.5 bg-white border border-orange-300 rounded p-1.5 shadow-sm animate-in fade-in duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black text-orange-600 uppercase tracking-wider">
                    Notas para cocina
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenNoteIndex(null)}
                    className="text-[8px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase transition-colors"
                  >
                    Listo
                  </button>
                </div>
                <textarea
                  autoFocus
                  rows={2}
                  placeholder={`Poca salsa\nMucho queso\nSin cebolla...`}
                  value={item.notes || ""}
                  onChange={(e) => updateItemNote?.(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      setOpenNoteIndex(null);
                    }
                  }}
                  className="w-full text-[10px] font-bold bg-slate-50 border border-slate-200 rounded p-1 outline-none focus:bg-white focus:border-orange-400 text-slate-800 placeholder:text-slate-400 placeholder:font-normal resize-none leading-tight"
                />
              </div>
            )}

            {/* RESUMEN DE NOTA CERRADA */}
            {hasNote && !isNoteOpen && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenNoteIndex(i);
                }}
                className="text-[9px] text-orange-700 font-bold mt-1 bg-orange-100/70 hover:bg-orange-100 px-1.5 py-1 rounded border border-orange-200/80 whitespace-pre-line leading-tight cursor-pointer"
              >
                {item.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
