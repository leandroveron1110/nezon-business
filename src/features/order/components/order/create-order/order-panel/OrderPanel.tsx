"use client";

import {
  DeliveryQuotationStatus,
  LocalOrderItem,
} from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { OrderTypeSelector } from "./components/OrderTypeSelector";
import { CustomerDeliverySection } from "./components/CustomerDeliverySection";
import { OrderItemList } from "./components/OrderItemList";
import { OrderFooter } from "./components/OrderFooter";
import { OrderDiscount } from "./components/OrderDiscount";
import { useState } from "react";
import { ChevronDown, ChevronUp, User, MapPin } from "lucide-react";

interface OrderPanelProps {
  businessId: string;
  isSubmitting: boolean;
  items: LocalOrderItem[];
  subTotal: number;
  discountAmount: number;
  setDiscountAmount: (value: number) => void;
  customerName: string;
  customerPhone: string;
  deliveryQuotationStatus: DeliveryQuotationStatus | undefined;
  customerAddress: string;
  deliveryType: "PICKUP" | "DELIVERY";
  deliveryProvider: "PLATFORM" | "INTERNAL";
  deliveryCost: number;
  paymentMethod:
    | "CASH"
    | "TRANSFER"
    | "QR"
    | "DEBIT_CARD"
    | "CREDIT_CARD"
    | "ACCOUNT"
    | "OTHER";
  scheduledAt: Date | null;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number;
  setDiscountType: (discountType: "PERCENTAGE" | "FIXED" | null) => void;
  setDiscountValue: (discountValue: number) => void;
  updateQty: (index: number, delta: number) => void;
  updateItemNote: (index: number, note: string) => void;
  createOrder: (instantPrepare?: boolean) => void;
  setCustomerName: (v: string) => void;
  setCustomerPhone: (v: string) => void;
  setDeliveryQuotationStatus: (v: DeliveryQuotationStatus | undefined) => void;
  setCustomerAddress: (v: string) => void;
  setDeliveryType: (v: "PICKUP" | "DELIVERY") => void;
  setDeliveryProvider: (v: "PLATFORM" | "INTERNAL") => void;
  setDeliveryCost: (v: number) => void;
  setPaymentMethod: (
    v:
      | "CASH"
      | "TRANSFER"
      | "QR"
      | "DEBIT_CARD"
      | "CREDIT_CARD"
      | "ACCOUNT"
      | "OTHER",
  ) => void;
  setZoneId: (v: string | null) => void;
  setScheduledAt: (v: Date | null) => void;
}

export function OrderPanel(props: OrderPanelProps) {
  const {
    businessId,
    isSubmitting,
    items,
    updateQty,
    updateItemNote,
    discountAmount,
    setDiscountAmount,
    subTotal,
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
    paymentMethod,
    setPaymentMethod,
    setZoneId,
    setDeliveryQuotationStatus,
    scheduledAt,
    setScheduledAt,
    discountType,
    discountValue,
    setDiscountType,
    setDiscountValue
  } = props;

  // Control de colapso de la sección de cliente/delivery
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);

  const isDelivery = deliveryType === "DELIVERY";

  // Resumen sintético para la barra colapsada
  const hasCustomerInfo =
    customerName.trim() || (isDelivery && customerAddress.trim());

  return (
    <div className="w-full flex flex-col bg-white h-full overflow-hidden select-none">
      {/* 1. SELECCIÓN DE TIPO DE PEDIDO (PICKUP / DELIVERY) */}
      <OrderTypeSelector
        deliveryType={deliveryType}
        setDeliveryType={(type) => {
          setDeliveryType(type);
          // Si cambia a delivery y no hay datos, desplegamos para facilitar la carga
          if (type === "DELIVERY" && !customerAddress) {
            setIsCustomerDetailsOpen(true);
          }
        }}
        scheduledAt={scheduledAt}
        setScheduledAt={setScheduledAt}
      />

      {/* 2. DATOS DE CLIENTE / DELIVERY (RETRACTIL) */}
      <div className="shrink-0 border-b border-slate-200 bg-slate-50 transition-all">
        {/* Barra de Encabezado / Resumen */}
        <button
          type="button"
          onClick={() => setIsCustomerDetailsOpen(!isCustomerDetailsOpen)}
          className="w-full flex h-7 items-center justify-between px-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-1.5 truncate">
            {isDelivery ? (
              <MapPin size={11} className="text-blue-500 shrink-0" />
            ) : (
              <User size={11} className="text-slate-400 shrink-0" />
            )}

            <span className="truncate font-black text-slate-700">
              {hasCustomerInfo ? (
                <>
                  {customerName || "Cliente sin nombre"}{" "}
                  {isDelivery && customerAddress && `• ${customerAddress}`}
                </>
              ) : (
                <span className="text-slate-400 font-medium">
                  + Datos de Cliente / Envíos (Opcional)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <span className="text-[8px] font-black uppercase tracking-wider">
              {isCustomerDetailsOpen ? "Ocultar" : "Editar"}
            </span>
            {isCustomerDetailsOpen ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </div>
        </button>

        {/* Formulario Desplegable */}
        {isCustomerDetailsOpen && (
          <div className="animate-in slide-in-from-top-1 duration-150">
            <CustomerDeliverySection
              businessId={businessId}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerAddress={customerAddress}
              setCustomerAddress={setCustomerAddress}
              deliveryType={deliveryType}
              deliveryProvider={deliveryProvider}
              setDeliveryProvider={setDeliveryProvider}
              deliveryCost={deliveryCost}
              setDeliveryCost={setDeliveryCost}
              setZoneId={setZoneId}
              setDeliveryQuotationStatus={setDeliveryQuotationStatus}
            />
          </div>
        )}
      </div>

      {/* 3. DESCUENTOS (REVELADO PROGRESIVO DE 1 LÍNEA) */}
      <OrderDiscount
        subtotal={subTotal}
        discountType={discountType}
        discountValue={discountValue}
        discountAmount={discountAmount}
        setDiscountAmount={setDiscountAmount}
        setDiscountType={setDiscountType}
        setDiscountValue={setDiscountValue}
      />

      {/* 4. LISTA DE PRODUCTOS (ÁREA PRINCIPAL CON SCROLL) */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/30">
        <OrderItemList
          items={items}
          updateQty={updateQty}
          updateItemNote={updateItemNote}
        />
      </div>

      {/* 5. FOOTER Y COBRO (FIJO ABAJO) */}
      <OrderFooter
        subtotal={subTotal}
        discountAmount={discountAmount}
        discountType={discountType}
        discountValue={discountValue}
        deliveryCost={deliveryCost}
        total={subTotal - discountAmount + (isDelivery ? deliveryCost : 0)}
        isDelivery={isDelivery}
        isSubmitting={isSubmitting}
        hasItems={items.length > 0}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        createOrder={createOrder}
      />
    </div>
  );
}
