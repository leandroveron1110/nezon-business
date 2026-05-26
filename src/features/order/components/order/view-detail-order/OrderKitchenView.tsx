"use client";

import { Clock, AlertCircle } from "lucide-react";
import { LocalOrder, LocalOrderItem } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";

interface OrderKitchenViewProps {
  order: LocalOrder;
  now: number; 
}

export function OrderKitchenView({ order, now }: OrderKitchenViewProps) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const elapsedMinutes = Math.floor((now - createdAt.getTime()) / 1000 / 60);

  // Alerta de tiempo ultra agresiva para que cocina sepa qué marchar ya
  const getTimerColor = (minutes: number) => {
    if (minutes >= 35) return "bg-red-600 text-white animate-pulse ring-4 ring-red-300";
    if (minutes >= 25) return "bg-orange-500 text-white";
    if (minutes >= 15) return "bg-yellow-400 text-black";
    return "bg-slate-900 text-white"; // El tiempo normal ahora es negro sólido, resalta más
  };

  const displayCode = 
    order.shortCode || 
    (order.dailyNumber ? `#${order.dailyNumber}` : null) || 
    `#${order.idTemp.slice(-6).toUpperCase()}`;

  return (
    <div className="w-full bg-white flex flex-col h-full text-slate-900 antialiased font-sans select-none p-1">
      
      {/* HEADER: CÓDIGO GIGANTE Y RELOJ DE PANIC */}
      <div className="flex items-center justify-between border-b-4 border-slate-900 pb-3 mb-3">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
            {displayCode}
          </h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mt-1">
            Cliente: {order.customerName ? order.customerName.toUpperCase() : "MOSTRADOR"}
          </p>
        </div>

        {/* Minutero gigante */}
        <div className={`flex items-center p-2 justify-center min-w-[70px] h-12 rounded-xl font-black text-xl shadow-md ${getTimerColor(elapsedMinutes)}`}>
          <Clock size={20} strokeWidth={3} className="mr-1" />
          <span>{elapsedMinutes}'</span>
        </div>
      </div>

      {/* OBSERVACIONES DE LA ORDEN (Solo si afectan a la comida) */}
      {order.customerObservations && (
        <div className="bg-amber-100 border-l-4 border-amber-600 text-amber-900 p-2 rounded-r-xl text-xs font-black mb-3 flex gap-2 items-center">
          <AlertCircle size={18} className="shrink-0 text-amber-700" />
          <p className="uppercase tracking-wide">
            NOTA PEDIDO: {order.customerObservations}
          </p>
        </div>
      )}

      {/* CUERPO CENTRAL: LISTADO DE PRODUCTOS A CONFECCIONAR */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        {order.items?.map((item: LocalOrderItem) => (
          <div 
            key={item.productId} 
            className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-sm"
          >
            {/* Fila Principal: Cantidad masiva y Nombre del producto */}
            <div className="flex items-center gap-3">
              {/* Multiplicador gigante en fondo negro */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-white">
                {item.quantity}
              </span>
              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
                {item.productName}
              </h4>
            </div>

            {/* OPCIONES / AGREGADOS (Ej: + Doble queso, + Panceta) */}
            {item.optionGroups && item.optionGroups.length > 0 && (
              <div className="ml-14 mt-2 space-y-1.5 border-l-4 border-slate-100 pl-3">
                {item.optionGroups.flatMap((g) => g.options).map((o) => (
                  <div key={o.optionId || o.optionName} className="text-base font-extrabold text-slate-700 uppercase flex items-center gap-1">
                    <span className="text-blue-600 font-black text-lg leading-none">+</span>
                    {o.optionName} {o.quantity > 1 && `(x${o.quantity})`}
                  </div>
                ))}
              </div>
            )}

            {/* MODIFICACIONES CRÍTICAS DEL ÍTEM (Ej: "SIN LECHUGA", "BIEN COCIDO") */}
            {item.notes && (
              <div className="ml-14 mt-2.5 bg-rose-600 text-white text-sm font-black px-3 py-1.5 rounded-lg w-fit uppercase flex items-center gap-1.5 animate-pulse shadow-sm">
                <span className="h-2 w-2 rounded-full bg-white block" />
                <span>{item.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PIE DE COMANDA: SOLO HORA DE ENTRADA */}
      <div className="mt-3 pt-2 border-t-2 border-slate-100 text-right text-xs font-black text-slate-400 uppercase">
        ENTRÓ: {createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} HS
      </div>

    </div>
  );
}