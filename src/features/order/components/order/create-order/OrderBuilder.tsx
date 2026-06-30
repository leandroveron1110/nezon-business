"use client";

import { useEffect, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useProducts } from "../../../hooks/useProducts";
import { X, LayoutPanelLeft } from "lucide-react";

import { OptionSelector } from "./OptionSelector";
import { ProductPanel } from "./ProductPanel";
import { OrderPanel } from "./OrderPanel";
import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";
import { createOrderOrchestrator } from "@/mini-back/orchestrator/order.orchestrator";
import {
  DeliveryQuotationStatus,
  LocalOrderItem,
  LocalOrderOptionGroup,
} from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { OrderSheet } from "./OrderSheet";

export default function OrderBuilder({
  onClose,
  businessid,
}: {
  onClose?: () => void;
  businessid: string;
}) {
  const { products } = useProducts();
  const [items, setItems] = useState<LocalOrderItem[]>([]);
  const [pendingProduct, setPendingProduct] = useState<LocalProduct | null>(
    null,
  );

  // Estados de cliente y logística
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [_zoneId, setZoneId] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">(
    "PICKUP",
  );
  const [deliveryProvider, setDeliveryProvider] = useState<
    "PLATFORM" | "INTERNAL"
  >("PLATFORM");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "QR" | "DELIVERY"
  >("CASH");
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryQuotationStatus, setDeliveryQuotationStatus] = useState<
    DeliveryQuotationStatus | undefined
  >(undefined);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const addProduct = (
    product: LocalProduct,
    options: LocalOrderOptionGroup[] = [],
    customNotes: string = "",
  ) => {
    setItems((prev) => {
      const cleanNotes = customNotes.trim();

      if (options.length === 0 && cleanNotes === "") {
        const existIndex = prev.findIndex(
          (p) =>
            p.productId === product.id &&
            p.optionGroups.length === 0 &&
            (!p.notes || p.notes.trim() === ""),
        );

        if (existIndex > -1) {
          return prev.map((p, idx) =>
            idx === existIndex ? { ...p, quantity: p.quantity + 1 } : p,
          );
        }
      }

      const extra = options.reduce(
        (a, g) => a + g.options.reduce((b, o) => b + o.priceFinal, 0),
        0,
      );

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          priceAtPurchase: product.finalPrice + extra,
          optionGroups: options,
          notes: cleanNotes,
        },
      ];
    });

    navigator.vibrate?.(10);
    setPendingProduct(null);
  };

  // 🔥 ACCIÓN 1: Click normal o Enter -> Va directo al grano (Sin Modales molestos)
  const handleProductClickDirect = useCallback((product: LocalProduct) => {
    // Si obligatoriamente tiene adicionales configurados por el local, se le abre el modal de todos modos
    if (product.optionGroups?.some((g) => g.minQuantity > 0)) {
      setPendingProduct(product);
      return;
    }
    // Si no tiene adicionales obligatorios, se añade limpio al instante
    addProduct(product, [], "");
  }, []);

  // 🛠️ ACCIÓN 2: Click en el boton de ajuste -> Abre modal a propósito para escribir notas
  const handleProductCustomize = useCallback((product: LocalProduct) => {
    setPendingProduct(product);
  }, []);

  const updateQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const updateItemNote = (index: number, note: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes: note } : item)),
    );
  };

  const totalProducts = items.reduce(
    (a, i) => a + i.priceAtPurchase * i.quantity,
    0,
  );

  const total = totalProducts + (deliveryType === "DELIVERY" ? deliveryCost : 0);

  const createOrder = async (instantPrepare?: boolean) => {
    if (!items.length || isSubmitting) return;
    setIsSubmitting(true);

    const newOrder = {
      idTemp: uuid(),
      id: null,
      customerName,
      customerPhone,
      customerAddress,
      total,
      deliveryType,
      deliveryProvider,
      totalDeliveryCost: deliveryType === "DELIVERY" ? deliveryCost : 0,
      orderPaymentMethod: paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      items: [...items],
      origin: "BUSINESS" as const,
      createdAt: new Date(),
      updatedAt: new Date(),

      deliveryStatus:
        deliveryType === "DELIVERY"
          ? DeliveryStatus.PENDING
          : DeliveryStatus.NOT_APPLICABLE,
    };

    try {
      await createOrderOrchestrator({
        ...newOrder,
        instantPrepare: !!instantPrepare,
        businessId: businessid,
        deliveryQuotationStatus: deliveryQuotationStatus,
      });
      setItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setDeliveryCost(0);
      onClose?.();
    } catch (error) {
      console.error("Error al crear el pedido:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center overflow-hidden backdrop-blur-sm p-0 md:p-2">
      {pendingProduct && (
        <OptionSelector
          product={pendingProduct}
          onClose={() => setPendingProduct(null)}
          onConfirm={(opts, notes) => addProduct(pendingProduct, opts, notes)}
        />
      )}

      <div className="bg-slate-50 w-full h-full max-w-[1600px] flex flex-col overflow-hidden shadow-2xl md:rounded-xl border border-slate-200">
        <header className="h-11 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-600 rounded-lg text-white">
              <LayoutPanelLeft size={14} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Nezon <span className="text-emerald-600">POS</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider"
          >
            <span>Salir (ESC)</span>
            <X size={12} />
          </button>
        </header>

        {/* DESKTOP */}
        <div className="hidden md:flex flex-1 w-full overflow-hidden">
          {/* Panel de Productos (60% del ancho total) */}
          <main className="w-3/5 h-full overflow-hidden bg-slate-100">
            <ProductPanel
              products={products}
              onProductClick={handleProductClickDirect}
              onProductCustomize={handleProductCustomize}
            />
          </main>

          {/* Panel de Orden (40% del ancho total) */}
          <aside className="w-2/5 h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden z-20">
            <OrderPanel
              isSubmitting={isSubmitting}
              businessId={businessid}
              items={items}
              deliveryQuotationStatus={deliveryQuotationStatus}
              setDeliveryQuotationStatus={setDeliveryQuotationStatus}
              updateQty={updateQty}
              total={total}
              updateItemNote={updateItemNote}
              createOrder={createOrder}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerAddress={customerAddress}
              setCustomerAddress={setCustomerAddress}
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              deliveryProvider={deliveryProvider}
              setDeliveryProvider={setDeliveryProvider}
              deliveryCost={deliveryCost}
              setDeliveryCost={setDeliveryCost}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              setZoneId={setZoneId}
            />
          </aside>
        </div>
        {/* MOBILE */}
        <div className="flex-1 md:hidden overflow-hidden">
          <ProductPanel
            products={products}
            onProductClick={handleProductClickDirect}
            onProductCustomize={handleProductCustomize}
          />

          <OrderSheet
            businessId={businessid}
            items={items}
            isSubmitting={isSubmitting}
            updateQty={updateQty}
            total={total}
            createOrder={createOrder}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
            deliveryProvider={deliveryProvider}
            setDeliveryProvider={setDeliveryProvider}
            deliveryCost={deliveryCost}
            setDeliveryCost={setDeliveryCost}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setZoneId={setZoneId}
            updateItemNote={updateItemNote}
            deliveryQuotationStatus={deliveryQuotationStatus}
            setDeliveryQuotationStatus={setDeliveryQuotationStatus}
          />
        </div>
      </div>
    </div>
  );
}
