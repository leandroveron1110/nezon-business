"use client";

import { useEffect, useState } from "react";
import { db } from "@/features/common/database";
import { v4 as uuid } from "uuid";
import { useProducts } from "../../../hooks/useProducts";
import { X } from "lucide-react"; // Importamos un icono más pro

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

  // Estados de cliente y logística
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [zoneId, setZoneId] = useState<string | null>(null);
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center overflow-hidden">
      {pendingProduct && (
        <OptionSelector
          product={pendingProduct}
          onClose={() => setPendingProduct(null)}
          onConfirm={(opts) => addProduct(pendingProduct, opts)}
        />
      )}

      <div className="bg-white w-full h-full md:flex md:flex-col overflow-hidden relative shadow-2xl">
        {/* HEADER COMPACTO PARA CIERRE */}
        <div className="absolute top-2 right-2 z-[60] md:top-4 md:right-4">
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 rounded-full transition-all shadow-sm"
            title="Cerrar (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex h-full overflow-hidden">
          {!isMobile ? (
            <>
              <div className="flex-1 h-full bg-slate-50">
                <ProductPanel
                  products={products}
                  onProductClick={handleProductClick}
                />
              </div>

              <div className="w-[380px] h-full shadow-2xl z-20">
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
                  setZoneId={setZoneId}
                />
              </div>
            </>
          ) : (
            <div className="relative w-full h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
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
                setZoneId={setZoneId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
