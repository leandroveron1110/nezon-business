"use client";

import { useEffect, useState } from "react";
import { db } from "@/features/common/database";
import { v4 as uuid } from "uuid";
import { useProducts } from "../../../hooks/useProducts";
import { X, LayoutPanelLeft } from "lucide-react";

import {
  LocalOrder,
  LocalOrderItem,
  LocalOrderOptionGroup,
} from "@/features/common/database/shcema/orders.schema";
import { LocalProduct } from "@/features/common/database/shcema/products.schema";

import { OptionSelector } from "./OptionSelector";
import { ProductPanel } from "./ProductPanel";
import { OrderPanel } from "./OrderPanel";
import { OrderSheet } from "./OrderSheet";
import { OrderStatus, PaymentStatus } from "@/types/order";

export default function OrderBuilder({ onClose }: { onClose?: () => void }) {
  const { products } = useProducts();
  const [items, setItems] = useState<LocalOrderItem[]>([]);
  const [pendingProduct, setPendingProduct] = useState<LocalProduct | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState(false);

  // Estados de cliente y logística
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  // const [customerNote, setCustomerNote] = useState("");
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

  // Detección de Mobile para Layout
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Atajo ESC para cerrar
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
  ) => {
    setItems((prev) => {
      if (options.length === 0) {
        const exist = prev.find(
          (p) => p.productId === product.id && p.optionGroups.length === 0,
        );
        if (exist) {
          return prev.map((p) =>
            p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p,
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
        },
      ];
    });
    navigator.vibrate?.(10);
    setPendingProduct(null);
  };

  const handleProductClick = (product: LocalProduct) => {
    if (product.optionGroups?.length) {
      const auto: LocalOrderOptionGroup[] = [];
      let needsModal = false;
      for (const g of product.optionGroups) {
        if (
          g.minQuantity === 1 &&
          g.maxQuantity === 1 &&
          g.options.length === 1
        ) {
          const o = g.options[0];
          auto.push({
            groupName: g.name,
            options: [
              {
                optionId: o.id,
                optionName: o.name,
                priceFinal: o.priceFinal,
                quantity: 1,
              },
            ],
          });
        } else {
          needsModal = true;
        }
      }
      if (!needsModal) return addProduct(product, auto);
      setPendingProduct(product);
      return;
    }
    addProduct(product);
  };

  const updateQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const totalProducts = items.reduce(
    (a, i) => a + i.priceAtPurchase * i.quantity,
    0,
  );
  const total =
    totalProducts + (deliveryType === "DELIVERY" ? deliveryCost : 0);

  const createOrder = async () => {
    if (!items.length) return;

    // 1. Definir estados con tipos literales para evitar el error de "string"
    let initialStatus: OrderStatus = OrderStatus.PENDING;
    let initialPaymentStatus: PaymentStatus = PaymentStatus.PENDING;

    if (paymentMethod === "CASH") {
      initialStatus = OrderStatus.PENDING_CONFIRMATION;
      initialPaymentStatus = PaymentStatus.PENDING;
    } else if (paymentMethod === "TRANSFER" || paymentMethod === "QR") {
      initialStatus = OrderStatus.WAITING_FOR_PAYMENT;
      initialPaymentStatus = PaymentStatus.PENDING;
    }

    // 2. Construir el objeto respetando la interfaz LocalOrder
    // Usamos 'as const' o tipado explícito para que syncStatus sea "pending_creation" y no string
    const newOrder: LocalOrder = {
      idTemp: uuid(),
      id: null,
      syncStatus: "pending_creation", // TypeScript ahora sabe que es el literal exacto
      customerName,
      customerPhone,
      customerAddress,
      total,
      deliveryType,
      deliveryProvider,
      deliveryPriceMode:
        deliveryProvider === "INTERNAL" ? "MANUAL" : "AUTOMATIC",
      totalDeliveryCost: deliveryType === "DELIVERY" ? deliveryCost : 0,
      orderPaymentMethod: paymentMethod,
      paymentStatus: initialPaymentStatus,
      items: [...items], // Copia superficial para evitar mutaciones
      status: initialStatus,
      origin: "BUSINESS",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.orders.add(newOrder);

      setItems([]);
      onClose?.();
    } catch (error) {
      console.error("Error en IndexedDB:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-0 md:p-4 lg:p-8 overflow-hidden backdrop-blur-sm">
      {pendingProduct && (
        <OptionSelector
          product={pendingProduct}
          onClose={() => setPendingProduct(null)}
          onConfirm={(opts) => addProduct(pendingProduct, opts)}
        />
      )}

      {/* MODAL CONTAINER */}
      <div className="bg-white w-full h-full max-w-7xl mx-auto md:h-[95vh] md:rounded-3xl flex flex-col overflow-hidden relative shadow-2xl border border-white/20">
        {/* HEADER DE CONTROL */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-white shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <LayoutPanelLeft size={18} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 leading-none">
                Locus <span className="text-blue-600">POS</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Terminal de Ventas v4.0
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="group flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <span>Cerrar</span>
            <X
              size={16}
              className="group-hover:rotate-90 transition-transform"
            />
          </button>
        </header>

        {/* MAIN LAYOUT */}
        <div className="flex-1 flex overflow-hidden bg-slate-100">
          {!isMobile ? (
            <>
              {/* ProductPanel (Desktop) */}
              <main className="flex-1 h-full overflow-hidden">
                <ProductPanel
                  products={products}
                  onProductClick={handleProductClick}
                />
              </main>

              {/* OrderPanel (Desktop) */}
              <aside className="w-[400px] h-full bg-white border-l shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-20">
                <OrderPanel
                  items={items}
                  updateQty={updateQty}
                  total={total}
                  createOrder={createOrder}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  customerAddress={customerAddress}
                  setCustomerAddress={setCustomerAddress}
                  // customerNote={customerNote}
                  // setCustomerNote={setCustomerNote}
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
            </>
          ) : (
            <div className="relative w-full h-full flex flex-col overflow-hidden">
              {/* ProductPanel (Mobile) */}
              <div className="flex-1 overflow-hidden">
                <ProductPanel
                  products={products}
                  onProductClick={handleProductClick}
                />
              </div>

              {/* OrderSheet (Mobile) */}
              <OrderSheet
                items={items}
                updateQty={updateQty}
                total={total}
                createOrder={createOrder}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customerAddress={customerAddress}
                setCustomerAddress={setCustomerAddress}
                // customerNote={customerNote}
                // setCustomerNote={setCustomerNote}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
