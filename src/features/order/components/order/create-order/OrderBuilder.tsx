"use client";

import { useEffect, useState } from "react";
import { db } from "@/features/common/database";
import { v4 as uuid } from "uuid";
import { useProducts } from "../../../hooks/useProducts";

import {
  LocalOrderItem,
  LocalOrderOptionGroup,
} from "@/features/common/database/shcema/orders.schema";

import { LocalProduct } from "@/features/common/database/shcema/products.schema";

import { OptionSelector } from "./OptionSelector";
import { ProductPanel } from "./ProductPanel";
import { OrderPanel } from "./OrderPanel";
import { OrderSheet } from "./OrderSheet";

export default function OrderBuilder({ onClose }: { onClose?: () => void }) {
  const { products } = useProducts();

  const [items, setItems] = useState<LocalOrderItem[]>([]);
  const [pendingProduct, setPendingProduct] = useState<LocalProduct | null>(
    null,
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ESC cierra todo (si el sheet no está abierto)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // logística
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

  // =========================
  // PRODUCTOS
  // =========================

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

  const updateQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  // =========================
  // TOTAL
  // =========================

  const totalProducts = items.reduce(
    (a, i) => a + i.priceAtPurchase * i.quantity,
    0,
  );

  const total =
    totalProducts + (deliveryType === "DELIVERY" ? deliveryCost : 0);

  // =========================
  // GUARDAR
  // =========================

  const createOrder = async () => {
    if (!items.length) return;

    await db.orders.add({
      idTemp: uuid(),
      id: null,
      syncStatus: "pending_creation",

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
      paymentStatus: "PENDING",

      items,

      status: "PENDING",
      origin: "BUSINESS",

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setItems([]);
    onClose?.();
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      {pendingProduct && (
        <OptionSelector
          product={pendingProduct}
          onClose={() => setPendingProduct(null)}
          onConfirm={(opts) => addProduct(pendingProduct, opts)}
        />
      )}

      <div
        className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg shadow text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* DESKTOP */}
        {!isMobile && (
          <div className="flex h-full">
            <ProductPanel
              products={products}
              onProductClick={handleProductClick}
            />

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
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              deliveryProvider={deliveryProvider}
              setDeliveryProvider={setDeliveryProvider}
              deliveryCost={deliveryCost}
              setDeliveryCost={setDeliveryCost}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>
        )}

        {/* MOBILE */}
        {isMobile && (
          <div className="relative h-full flex flex-col overflow-hidden">
            <div className="pb-24 h-full">
              <ProductPanel
                products={products}
                onProductClick={handleProductClick}
              />
            </div>

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
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              deliveryProvider={deliveryProvider}
              setDeliveryProvider={setDeliveryProvider}
              deliveryCost={deliveryCost}
              setDeliveryCost={setDeliveryCost}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>
        )}
      </div>
    </div>
  );
}
