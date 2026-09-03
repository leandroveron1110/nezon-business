"use client";

import { useEffect, useState } from "react";
import { OrderItem } from "@/types/order";
import { IOrder, DeliveryType } from "../../../types/order";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

interface OrderTicketProps {
  order: IOrder;
  mode: "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP";
}

const PAYMENT_LABELS: Record<PaymentMethodTypeFinancial, string> = {
  [PaymentMethodTypeFinancial.CASH]: "EFECTIVO",
  [PaymentMethodTypeFinancial.TRANSFER]: "TRANSFERENCIA",
  [PaymentMethodTypeFinancial.OTHER]: "OTRO",
  [PaymentMethodTypeFinancial.QR]: "QR",
  [PaymentMethodTypeFinancial.ACCOUNT]: "ACCOUNT",
  [PaymentMethodTypeFinancial.CREDIT_CARD]: "CREDIT_CARD",
  [PaymentMethodTypeFinancial.DEBIT_CARD]: "DEBIT_CARD",
  [PaymentMethodTypeFinancial.MERCADO_PAGO]: "MERCADO_PAGO",
};

const formatMoney = (value: number) =>
  value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

export function OrderTicket({ order, mode }: OrderTicketProps) {
  const isKitchen = mode === "KITCHEN";
  const isDelivery = order.deliveryType === DeliveryType.DELIVERY;

  const [paperWidth, setPaperWidth] = useState<58 | 80>(80);

  useEffect(() => {
    const saved = localStorage.getItem("ticket-paper-width");
    if (saved === "58") {
      setPaperWidth(58);
    } else {
      setPaperWidth(80);
    }
  }, []);

  const date = new Date();

  // Muestra el costo base del producto x cantidad
  const getProductBaseTotal = (item: OrderItem) => {
    return (item.priceAtPurchase || 0) * item.quantity;
  };

  const widthCss = paperWidth === 58 ? "58mm" : "80mm";

  return (
    <div
      data-ticket-root
      style={{
        width: widthCss,
        minWidth: widthCss,
        maxWidth: widthCss,
        boxSizing: "border-box",
      }}
      className={`
        text-black
        font-mono
        bg-white
        leading-tight
        ${paperWidth === 58 ? "p-2 text-[10px]" : "p-3 text-[12px]"}
      `}
    >
      {/* HEADER */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        {isKitchen ? (
          <h3
            className={`font-extrabold leading-tight tracking-tight ${
              paperWidth === 58 ? "text-base" : "text-lg"
            }`}
          >
            *** COMANDA ***
          </h3>
        ) : (
          <>
            <h3
              className={`font-extrabold leading-tight tracking-tight ${
                paperWidth === 58 ? "text-base" : "text-lg"
              }`}
            >
              {order.bussiness?.name?.toUpperCase() || "COMERCIO"}
            </h3>

            {order.bussiness?.address && (
              <p className={paperWidth === 58 ? "text-[8px]" : "text-[9px]"}>
                {order.bussiness.address}
              </p>
            )}

            <p className={paperWidth === 58 ? "text-[8px]" : "text-[9px]"}>
              Ticket no fiscal
            </p>
          </>
        )}

        <div
          className={`flex justify-between mt-2 ${
            paperWidth === 58 ? "text-[8px]" : "text-[10px]"
          }`}
        >
          <span>#{order.id.slice(-6).toUpperCase()}</span>

          <span>
            {date.toLocaleDateString("es-AR")}{" "}
            {date.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* CLIENTE */}
      {!isKitchen && (
        <div
          className={`border-b border-dashed border-black pb-2 mb-2 uppercase ${
            paperWidth === 58 ? "text-[8px]" : "text-[9px]"
          }`}
        >
          <p>
            <b>Cliente:</b> {order.user?.fullName || "SIN NOMBRE"}
          </p>

          <p>
            <b>Modo:</b> {isDelivery ? "DELIVERY" : "RETIRO"}
          </p>

          {isDelivery && (
            <div className="pt-1">
              <p>
                <b>Dirección:</b> {order.user?.address || "SIN DIRECCIÓN"}
              </p>

              {order.customerObservations && (
                <p>
                  <b>OBS:</b> {order.customerObservations}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ITEMS */}
      <div className="mb-2">
        <div
          className={`flex justify-between border-b border-black font-bold ${
            paperWidth === 58 ? "text-[9px]" : "text-[10px]"
          }`}
        >
          <span>DETALLE</span>
          {!isKitchen && <span>PRECIO</span>}
        </div>

        {order.items?.map((item) => (
          <div key={item.id} className="mt-2">
            {/* Cabecera del ítem: Nombre + Precio Base del producto */}
            <div className="flex justify-between font-bold">
              <span>
                {item.quantity} x {item.productName.toUpperCase()}
              </span>

              {!isKitchen && (
                <span>{formatMoney(getProductBaseTotal(item))}</span>
              )}
            </div>

            {/* Opciones y Adicionales */}
            {item.optionGroups
              ?.flatMap((g) => g.options)
              .map((o) => (
                <div
                  key={o.id}
                  className={`flex justify-between ml-3 text-gray-700 ${
                    paperWidth === 58 ? "text-[8px]" : "text-[10px]"
                  }`}
                >
                  <span>+ {o.optionName}</span>

                  {!isKitchen && (
                    <span>
                      {o.priceFinal > 0
                        ? `+${formatMoney((o.priceFinal || 0) * item.quantity)}`
                        : "$0"}
                    </span>
                  )}
                </div>
              ))}

            {/* Notas / Observaciones por ítem */}
            {item.notes && (
              <p
                className={`ml-3 font-semibold ${
                  paperWidth === 58 ? "text-[8px]" : "text-[10px]"
                }`}
              >
                * {item.notes.toUpperCase()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* TOTALES */}
      {!isKitchen && (
        <div
          className={`border-t-2 border-black pt-2 ${
            paperWidth === 58 ? "text-[9px]" : "text-[11px]"
          }`}
        >
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>
              {formatMoney(order.total - (order.totalDeliveryCost || 0))}
            </span>
          </div>

          {isDelivery && (
            <div className="flex justify-between">
              <span>ENVÍO</span>
              <span>{formatMoney(order.totalDeliveryCost || 0)}</span>
            </div>
          )}

          <div
            className={`flex justify-between font-bold border-y border-black my-1 py-1 ${
              paperWidth === 58 ? "text-sm" : "text-base"
            }`}
          >
            <span>TOTAL</span>
            <span>{formatMoney(order.total)}</span>
          </div>

          <p>
            <b>Pago:</b> {PAYMENT_LABELS[order.orderPaymentMethod] || "N/A"}
          </p>
        </div>
      )}

      {!isKitchen && (
        <div
          className={`mt-3 text-center border border-black p-1 ${
            paperWidth === 58 ? "text-[7px]" : "text-[9px]"
          }`}
        >
          DOCUMENTO NO VÁLIDO COMO FACTURA
        </div>
      )}

      <div className={paperWidth === 58 ? "h-6" : "h-10"} />
    </div>
  );
}
