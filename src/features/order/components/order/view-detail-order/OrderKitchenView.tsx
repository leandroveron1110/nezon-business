"use client";

import { Clock, AlertCircle, ChefHat } from "lucide-react";
import { LocalOrder, LocalOrderItem } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";

interface OrderKitchenViewProps {
  order: LocalOrder;
  now: number; 
}

export function OrderKitchenView({ order, now }: OrderKitchenViewProps) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const elapsedMinutes = Math.floor((now - createdAt.getTime()) / 1000 / 60);

  const getTimerColor = (minutes: number) => {
    if (minutes >= 35) return "text-red-600 font-black animate-pulse";
    if (minutes >= 25) return "text-orange-500 font-black";
    if (minutes >= 15) return "text-yellow-500 font-black";
    return "text-slate-900 font-black";
  };

  const displayCode = 
    order.shortCode || 
    (order.dailyNumber ? `#${order.dailyNumber}` : null) || 
    `#${order.idTemp.slice(-6).toUpperCase()}`;

  return (
    <div className="w-full text-slate-900 antialiased font-sans select-none flex flex-col gap-5">
      
      {/* HEADER LIMPIO: TICKET ESTILO RESTO */}
      <div className="flex items-start justify-between border-b-2 border-dashed border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
              order.deliveryType === "DELIVERY" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"
            }`}>
              {order.deliveryType === "DELIVERY" ? "🚀 Enviar" : "🛍️ Retira"}
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
            {displayCode}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase mt-1">
            Cliente: <span className="text-slate-700 font-black">{order.customerName ? order.customerName.toUpperCase() : "MOSTRADOR"}</span>
          </p>
        </div>

        {/* Tiempo transcurrido minimalista pero gigante */}
        <div className="flex flex-col items-end justify-center">
          <div className={`flex items-center gap-1 text-2xl ${getTimerColor(elapsedMinutes)}`}>
            <Clock size={20} strokeWidth={3} className="shrink-0" />
            <span>{elapsedMinutes}'</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Demora</span>
        </div>
      </div>

      {/* NOTAS GENERALES DE LA ORDEN (Si existen) */}
      {order.customerObservations && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs font-bold flex gap-2 items-start shadow-sm">
          <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="uppercase whitespace-pre-line leading-normal">
            <span className="text-amber-700 block text-[9px] font-black tracking-wider mb-0.5">NOTA GENERAL DE LA ORDEN:</span>
            {order.customerObservations}
          </div>
        </div>
      )}

      {/* LISTADO DE PRODUCTOS IMPRESO LIMPIO */}
      <div className="space-y-4">
        {order.items?.map((item: LocalOrderItem, index: number) => (
          <div 
            key={`${item.productId}-${index}`} 
            className="pb-4 border-b border-slate-100 last:border-none"
          >
            {/* Cabecera del producto */}
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-black text-white shadow-sm mt-0.5">
                {item.quantity}
              </span>
              <div className="flex-1">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-snug">
                  {item.productName}
                </h4>

                {/* Agregados / Opciones del producto */}
                {item.optionGroups && item.optionGroups.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {item.optionGroups.flatMap((g) => g.options).map((o) => (
                      <div key={o.optionId || o.optionName} className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <span className="text-blue-500 font-black text-sm leading-none">+</span>
                        {o.optionName} {o.quantity > 1 && `(x${o.quantity})`}
                      </div>
                    ))}
                  </div>
                )}

                {/* OBSERVACIONES DEL PRODUCTO (Aquí se aplica el multilínea limpio) */}
                {item.notes && (
                  <div className="mt-2 bg-rose-50/50 border-l-2 border-rose-500 pl-2.5 py-1 text-xs uppercase text-rose-950 font-medium">
                    <span className="text-[9px] font-black text-rose-600 block tracking-wider mb-0.5">Obs:</span>
                    <ul className="list-disc list-inside space-y-0.5 font-bold tracking-wide">
                      {item.notes.split("\n").filter(Boolean).map((line, lineIdx) => (
                        <li key={lineIdx} className="marker:text-rose-500">
                          {line.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FECHA/HORA DE ENTRADA AL PIE */}
      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <ChefHat size={12} />
          <span>Hunay POS</span>
        </div>
        <div>
          ENTRÓ: {createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} HS
        </div>
      </div>

    </div>
  );
}