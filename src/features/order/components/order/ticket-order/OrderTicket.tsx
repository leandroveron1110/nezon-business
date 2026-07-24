"use client";

import { OrderItem } from "@/types/order";
import { IOrder, DeliveryType } from "../../../types/order";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

interface OrderTicketProps {
  order: IOrder;
  mode: "KITCHEN" | "CUSTOMER" | "SHARE_WHATSAPP";
}



const PAYMENT_LABELS: Record<PaymentMethodTypeFinancial , string> = {
  [PaymentMethodTypeFinancial.CASH]: "EFECTIVO",
  [PaymentMethodTypeFinancial.TRANSFER]: "TRANSFERENCIA",
  [PaymentMethodTypeFinancial.OTHER]: "OTRO",
  [PaymentMethodTypeFinancial.QR]:"QR",
  [PaymentMethodTypeFinancial.ACCOUNT]: "ACCOUNT",
  [PaymentMethodTypeFinancial.CREDIT_CARD]: "CREDIT_CARD",
  [PaymentMethodTypeFinancial.DEBIT_CARD]: "DEBIT_CARD",
  [PaymentMethodTypeFinancial.MERCADO_PAGO]: "MERCADO_PAGO"
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

  const date = new Date();

  // 🔥 TOTAL REAL POR ITEM (incluye opciones)
  const getItemTotal = (item: OrderItem) => {
    const optionsTotal =
      item.optionGroups
        ?.flatMap((g) => g.options)
        .reduce((acc: number, o) => acc + (o.priceFinal || 0), 0) || 0;

    return (item.priceAtPurchase + optionsTotal) * item.quantity;
  };

  return (
    <div className="text-black font-mono w-[80mm] bg-white p-3 leading-tight text-[12px]">
      {/* HEADER */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        {isKitchen ? (
<h3 className="text-lg font-extrabold leading-tight tracking-tight">
            *** COMANDA ***
          </h3>
        ) : (
          <>
<h3 className="text-lg font-extrabold leading-tight tracking-tight">
              {order.bussiness?.name?.toUpperCase() || "COMERCIO"}
            </h3>
            {order.bussiness?.address && (
              <p className="text-[9px]">{order.bussiness.address}</p>
            )}
            <p className="text-[9px] uppercase">Ticket no fiscal</p>
          </>
        )}

        <div className="flex justify-between text-[10px] mt-2">
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
        <div className="border-b border-dashed border-black pb-2 mb-2 text-[9px] uppercase">
          <p>
            <b>Cliente:</b> {order.user?.fullName || "SIN NOMBRE"}
          </p>

          <p>
            <b>Modo:</b> {isDelivery ? "DELIVERY" : "RETIRO EN LOCAL"}
          </p>

          {isDelivery && (
            <div className="pt-1 text-[10px]">
              <p><b>Dirección:</b>{order.user?.address || "SIN DIRECCIÓN"}</p>
              {order.customerObservations && (
                <p>
                  <b>OBS:</b> <span>{order.customerObservations}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ITEMS */}
      <div className="mb-2">
        <div className="flex justify-between border-b border-black font-bold text-[10px]">
          <span>DETALLE</span>
          {!isKitchen && <span>TOTAL</span>}
        </div>

        {order.items?.map((item) => (
          <div key={item.id} className="mt-1">
            <div className="flex justify-between">
              <span>
                {item.quantity} x {item.productName.toUpperCase()}
              </span>

              {!isKitchen && (
                <span className="font-bold">
                  {formatMoney(getItemTotal(item))}
                </span>
              )}
            </div>

            {/* OPCIONES */}
            {item.optionGroups
              ?.flatMap((g) => g.options)
              .map((o) => (
                <div
                  key={o.id}
                  className="flex justify-between ml-3 text-[10px]"
                >
                  <span>+ {o.optionName}</span>
                  {!isKitchen && o.priceFinal > 0 && (
                    <span>+{formatMoney(o.priceFinal * item.quantity)}</span>
                  )}
                </div>
              ))}

            {/* NOTAS DEL ITEM */}
            {item.notes && (
              <p className="ml-3 text-[10px] font-bold">
                * {item.notes.toUpperCase()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* TOTALES */}
      {!isKitchen && (
        <div className="border-t-2 border-black pt-2 text-[11px]">
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

          <div className="flex justify-between font-bold text-base border-y border-black my-1 py-1">
            <span>TOTAL</span>
            <span>{formatMoney(order.total)}</span>
          </div>

          <div>
            <p>
              <b>Pago:</b> {PAYMENT_LABELS[order.orderPaymentMethod] || "N/A"}
            </p>
          </div>
        </div>
      )}


      {/* LEGAL */}
      {!isKitchen && (
        <div className="mt-3 text-center border border-black p-1 text-[9px]">
          DOCUMENTO NO VÁLIDO COMO FACTURA
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
