"use client";

import { useState, useEffect } from "react";
import { OrderPanel } from "./OrderPanel";
import { LocalOrderItem } from "@/features/common/database/shcema/orders.schema";

interface OrderSheetProps {
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
  setZoneId: (v: string | null) => void;
}
export function OrderSheet(props: OrderSheetProps) {
  const [open, setOpen] = useState(false);

  // ESC cierra solo el sheet
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      {props.items.length > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl font-black z-40"
        >
          {props.items.length} productos · ${props.total.toLocaleString()}
        </button>
      )}

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* SHEET */}
      {open && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom"
          style={{ height: "85vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HANDLE */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
          </div>

          <OrderPanel {...props} />
        </div>
      )}
    </>
  );
}
