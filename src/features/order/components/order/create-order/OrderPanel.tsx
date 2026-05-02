"use client";

import { LocalOrderItem } from "@/features/common/database/shcema/orders.schema";
import {
  Trash2,
  Plus,
  Minus,
  Send,
  Zap,
  Truck,
  Store,
} from "lucide-react";

interface OrderPanelProps {
  items: LocalOrderItem[];
  updateQty: (index: number, delta: number) => void;
  total: number;
  createOrder: () => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerAddress: string;
  setCustomerAddress: (v: string) => void;
  deliveryType: "PICKUP" | "DELIVERY";
  setDeliveryType: (v: "PICKUP" | "DELIVERY") => void;
  deliveryProvider: "PLATFORM" | "INTERNAL";
  setDeliveryProvider: (v: "PLATFORM" | "INTERNAL") => void;
  deliveryCost: number;
  setDeliveryCost: (v: number) => void;
    // 🆕 pago
  paymentMethod: "CASH" | "TRANSFER" | "QR" | "DELIVERY";
  setPaymentMethod: (v: "CASH" | "TRANSFER" | "QR" | "DELIVERY") => void;
}

export function OrderPanel({
  items,
  updateQty,
  total,
  createOrder,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  deliveryType,
  setDeliveryType,
  deliveryProvider,
  setDeliveryProvider,
  deliveryCost,
  setDeliveryCost,
  setPaymentMethod,
  paymentMethod
}: OrderPanelProps) {
  const isDelivery = deliveryType === "DELIVERY";
  const isLocus = deliveryProvider === "PLATFORM";

  const subtotal = items.reduce(
    (acc, item) => acc + item.priceAtPurchase * item.quantity,
    0
  );

  return (
    <div className="md:w-[360px] border-l flex flex-col bg-white h-full overflow-hidden">
      {/* 1. SELECTOR RETIRO / ENVÍO */}
      <div className="flex border-b divide-x">
        <button
          onClick={() => setDeliveryType("PICKUP")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-black transition-colors ${
            !isDelivery
              ? "bg-slate-900 text-white"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <Store className="w-3.5 h-3.5" /> RETIRO
        </button>

        <button
          onClick={() => setDeliveryType("DELIVERY")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-black transition-colors ${
            isDelivery
              ? "bg-blue-600 text-white"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> ENVÍO
        </button>
      </div>

      {/* 2. DATOS CLIENTE */}
      <div className="p-2 bg-slate-100/50 border-b space-y-2">
        <div className="flex gap-1.5">
          <input
            placeholder="Cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 min-w-0 p-2 bg-white border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-500"
          />

          <input
            placeholder="WhatsApp"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-[110px] p-2 bg-white border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-500"
          />
        </div>

        {/* BLOQUE DELIVERY ANIMADO */}
        <div
          className={`space-y-1.5 transition-all duration-300 overflow-hidden ${
            isDelivery ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          {/* Selector proveedor */}
          <div className="flex bg-slate-100 rounded border border-slate-200 p-0.5">
            <button
              onClick={() => setDeliveryProvider("INTERNAL")}
              className={`flex-1 py-1 text-[10px] font-black rounded transition-all ${
                !isLocus
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400"
              }`}
            >
              CADETE
            </button>

            <button
              onClick={() => setDeliveryProvider("PLATFORM")}
              className={`flex-1 py-1 flex items-center justify-center gap-1 text-[10px] font-black rounded transition-all ${
                isLocus
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-400"
              }`}
            >
              <Zap className="w-3 h-3" />
              APP
            </button>
          </div>

          {/* Dirección + costo */}
          <div className="flex gap-1.5">
            <input
              placeholder="Dirección exacta..."
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="flex-1 p-2 bg-white border border-blue-200 rounded text-xs font-bold outline-none"
            />

            {!isLocus && (
              <input
                type="number"
                placeholder="$ Envío"
                value={deliveryCost || ""}
                onChange={(e) => setDeliveryCost(Number(e.target.value))}
                className="w-[70px] p-2 bg-green-50 border border-green-200 rounded text-xs font-black text-green-700 outline-none"
              />
            )}
          </div>

          {/* Feedback mensajería */}
          {isLocus && (
            <div className="text-[9px] text-blue-500 font-bold px-1">
              El costo lo calcula automáticamente la app
            </div>
          )}
        </div>
      </div>

      {/* 3. ITEMS */}
      <div className="flex-1 overflow-auto bg-white select-none">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-300 italic text-[11px] uppercase font-bold tracking-widest">
            Orden vacía
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, i) => (
              <div key={i} className="p-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-700 truncate uppercase">
                      {item.productName}
                    </p>

                    <p className="text-[10px] font-bold text-blue-500 tabular-nums">
                      ${item.priceAtPurchase.toLocaleString()}
                    </p>
                  </div>

                  {/* CONTROLES */}
                  <div className="flex items-center bg-slate-100 rounded border border-slate-200">
                    <button
                      onClick={() => updateQty(i, -1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3 h-3 text-red-500" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>

                    <span className="w-5 text-center font-black text-[11px]">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQty(i, 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* ADDONS PLANOS */}
                {item.optionGroups && item.optionGroups.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.optionGroups.flatMap((group) =>
                      group.options.map((opt, idx) => (
                        <div
                          key={`${group.groupName}-${idx}`}
                          className="flex items-center px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-600"
                        >
                          + {opt.quantity > 1 && `${opt.quantity}x `}
                          {opt.optionName}

                          {opt.priceFinal > 0 && (
                            <span className="ml-1 text-blue-600">
                              (+${opt.priceFinal})
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

            {/* 🆕 MÉTODO DE PAGO */}
      <div className="p-2 border-t">
        <p className="text-[10px] font-bold mb-1">Pago</p>
        <div className="flex gap-1">
          {[
            { key: "CASH", label: "EFECTIVO" },
            { key: "TRANSFER", label: "TRANSFER" },
            { key: "QR", label: "QR" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setPaymentMethod(m.key as any)}
              className={`flex-1 py-2 text-[10px] font-black rounded ${
                paymentMethod === m.key
                  ? "bg-green-500 text-white"
                  : "bg-slate-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. FOOTER */}
      <div className="bg-slate-900 text-white">
        <div className="p-3 space-y-0.5 border-b border-white/5">
          <div className="flex justify-between opacity-50">
            <span className="text-[9px] font-black uppercase">
              Subtotal
            </span>
            <span className="text-xs font-mono">
              ${subtotal.toLocaleString()}
            </span>
          </div>

          {isDelivery && (
            <div className="flex justify-between text-blue-400">
              <span className="text-[9px] font-black uppercase">
                Envío {isLocus ? "(App)" : "(Propio)"}
              </span>

              <span className="text-xs font-mono">
                {isLocus
                  ? "Calculado"
                  : `+$${deliveryCost.toLocaleString()}`}
              </span>
            </div>
          )}

          <div className="flex justify-between items-end pt-1">
            <span className="text-xs font-black uppercase text-blue-500">
              Total
            </span>

            <span className="text-4xl font-black italic">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={createOrder}
          disabled={items.length === 0 || (isDelivery && !customerAddress)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-4 flex items-center justify-center gap-3"
        >
          <span className="font-black text-lg uppercase">
            Confirmar Orden
          </span>
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}