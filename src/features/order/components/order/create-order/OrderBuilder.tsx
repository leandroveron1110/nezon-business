"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { v4 as uuid } from "uuid";
import { useProducts } from "../../../hooks/useProducts";
import { X, LayoutPanelLeft } from "lucide-react";

import { OptionSelector } from "./optionaSelector/OptionSelector";
import { ProductPanel } from "./ProductPanel";
import { OrderPanel } from "./order-panel/OrderPanel";

import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";

import {
  createOrderOrchestrator,
  updateOrderOrchestrator,
} from "@/mini-back/orchestrator/order.orchestrator";

import {
  DeliveryQuotationStatus,
  LocalOrder,
  LocalOrderItem,
  LocalOrderOptionGroup,
} from "@/mini-back/infrastructure/dexie/shcema/orders.schema";

import { LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";

import { initSchedulers } from "@/mini-back/infrastructure/workers/delivery/delivery.worker";

import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

import { db } from "@/mini-back/infrastructure/dexie/db";

interface OrderBuilderProps {
  onClose?: () => void;
  businessid: string;
  printOrderCreated: (orderId: string) => void;

  /**
   * CREATE:
   *   orderIdTemp = undefined
   *
   * EDIT:
   *   orderIdTemp = idTemp de la orden existente
   */
  mode?: "CREATE" | "EDIT";
  orderIdTemp?: string;
}

export default function OrderBuilder({
  onClose,
  businessid,
  printOrderCreated,
  mode = "CREATE",
  orderIdTemp,
}: OrderBuilderProps) {
  const { products } = useProducts();

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const [editingOrder, setEditingOrder] = useState<LocalOrder | null>(null);

  const [isLoadingOrder, setIsLoadingOrder] = useState(mode === "EDIT");

  const [items, setItems] = useState<LocalOrderItem[]>([]);

  const [pendingProduct, setPendingProduct] = useState<LocalProduct | null>(
    null,
  );

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

  const [deliveryCost, setDeliveryCost] = useState(0);

  const [deliveryQuotationStatus, setDeliveryQuotationStatus] = useState<
    DeliveryQuotationStatus | undefined
  >(undefined);

  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    | "CASH"
    | "TRANSFER"
    | "QR"
    | "DEBIT_CARD"
    | "CREDIT_CARD"
    | "ACCOUNT"
    | "OTHER"
  >("CASH");

  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED" | null
  >(null);

  const [discountValue, setDiscountValue] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current?.();
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  // ==========================================================================
  // CARGAR ORDEN PARA EDITAR
  // ==========================================================================

  useEffect(() => {
    if (mode !== "EDIT" || !orderIdTemp) {
      setIsLoadingOrder(false);
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setIsLoadingOrder(true);

        const order = await db.orders
          .where("idTemp")
          .equals(orderIdTemp)
          .first();

        if (cancelled) return;

        if (!order) {
          console.error("No se encontró la orden para editar:", orderIdTemp);

          onCloseRef.current?.();
          return;
        }

        setEditingOrder(order);

        // ================================================================
        // PRODUCTOS
        // ================================================================

        setItems(order.items ?? []);

        // ================================================================
        // CLIENTE
        // ================================================================

        setCustomerName(order.customerName ?? "");

        setCustomerPhone(order.customerPhone ?? "");

        setCustomerAddress(order.customerAddress ?? "");

        // ================================================================
        // LOGÍSTICA
        // ================================================================

        setZoneId(order.zoneId ?? null);

        setDeliveryType(order.deliveryType);

        setDeliveryProvider(order.deliveryProvider);

        setDeliveryCost(order.totalDeliveryCost ?? 0);

        setDeliveryQuotationStatus(order.deliveryQuotationStatus);

        setScheduledAt(order.scheduledAt ? new Date(order.scheduledAt) : null);

        // ================================================================
        // PAGO
        // ================================================================

        setPaymentMethod(order.orderPaymentMethod);

        // ================================================================
        // DESCUENTO
        // ================================================================

        setDiscountType(order.discountType ?? null);

        setDiscountValue(order.discountValue ?? 0);

        setDiscountAmount(order.discountAmount ?? 0);
      } catch (error) {
        console.error("Error al cargar la orden para editar:", error);

        if (!cancelled) {
          onCloseRef.current?.();
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrder(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [mode, orderIdTemp]);

  // ==========================================================================
  // AGREGAR PRODUCTO
  // ==========================================================================

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
            idx === existIndex
              ? {
                  ...p,
                  quantity: p.quantity + 1,
                }
              : p,
          );
        }
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          priceAtPurchase: product.finalPrice,
          optionGroups: options,
          notes: cleanNotes,
          costAtPurchase: product.cost,
        },
      ];
    });

    navigator.vibrate?.(10);

    setPendingProduct(null);
  };

  // ==========================================================================
  // CLICK DIRECTO
  // ==========================================================================

  const handleProductClickDirect = useCallback((product: LocalProduct) => {
    if (product.optionGroups?.some((g) => g.minQuantity > 0)) {
      setPendingProduct(product);
      return;
    }

    addProduct(product, [], "");
  }, []);

  // ==========================================================================
  // PERSONALIZAR PRODUCTO
  // ==========================================================================

  const handleProductCustomize = useCallback((product: LocalProduct) => {
    setPendingProduct(product);
  }, []);

  // ==========================================================================
  // ACTUALIZAR CANTIDAD
  // ==========================================================================

  const updateQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: item.quantity + delta,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ==========================================================================
  // ACTUALIZAR NOTA
  // ==========================================================================

  const updateItemNote = (index: number, note: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              notes: note,
            }
          : item,
      ),
    );
  };

  // ==========================================================================
  // CÁLCULOS
  // ==========================================================================

  const calculateItemSubtotal = (item: LocalOrderItem): number => {
    const basePrice = item.priceAtPurchase ?? 0;

    const optionsPrice = (item.optionGroups ?? []).reduce((groupSum, group) => {
      const groupOptionsSum = (group.options ?? []).reduce((optSum, opt) => {
        return optSum + (opt.priceFinal ?? 0) * (opt.quantity ?? 1);
      }, 0);

      return groupSum + groupOptionsSum;
    }, 0);

    return (basePrice + optionsPrice) * item.quantity;
  };

  const calculateOrderProductsTotal = (
    orderItems: LocalOrderItem[],
  ): number => {
    return orderItems.reduce(
      (acc, item) => acc + calculateItemSubtotal(item),
      0,
    );
  };

  const subTotal = useMemo(() => {
    return calculateOrderProductsTotal(items);
  }, [items]);

  // ==========================================================================
  // GUARDAR ORDEN
  // ==========================================================================

  const saveOrder = async (instantPrepare: boolean = false) => {
    if (!items.length || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ======================================================================
      // EDITAR ORDEN EXISTENTE
      // ======================================================================

      if (orderIdTemp) {
        await updateOrderOrchestrator({
          idTemp: orderIdTemp,
          customerName,
          customerPhone,
          customerAddress,
          deliveryType,
          deliveryProvider,
          totalDeliveryCost: deliveryType === "DELIVERY" ? deliveryCost : 0,
          orderPaymentMethod: paymentMethod as PaymentMethodTypeFinancial,
          items: [...items],
          scheduledAt,
          subtotal: subTotal,
          discountType,
          discountValue,
          deliveryQuotationStatus,
        });
        initSchedulers();
        onCloseRef.current?.();

        return;
      }

      // ======================================================================
      // CREAR NUEVA ORDEN
      // ======================================================================
      const total = subTotal - discountAmount;

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
        orderPaymentMethod: paymentMethod as PaymentMethodTypeFinancial,
        paymentStatus: PaymentStatus.PENDING,
        items: [...items],
        origin: "BUSINESS" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledAt,
        deliveryStatus:
          deliveryType === "DELIVERY"
            ? DeliveryStatus.PENDING
            : DeliveryStatus.NOT_APPLICABLE,
      };

      await createOrderOrchestrator(
        {
          ...newOrder,
          subtotal: subTotal,
          discountType,
          discountValue,
          instantPrepare: true,
          businessId: businessid,
          deliveryQuotationStatus,
        },
        instantPrepare,
      );
      printOrderCreated(newOrder.idTemp);
      initSchedulers();
      setItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setDeliveryCost(0);
      setDiscountAmount(0);
      setDiscountType(null);
      setDiscountValue(0);
      setScheduledAt(null);

      onCloseRef.current?.();
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // LOADING DE EDICIÓN
  // ==========================================================================

  if (mode === "EDIT" && isLoadingOrder) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white rounded-xl px-6 py-5 shadow-2xl">
          <p className="text-sm font-bold text-slate-700">Cargando orden...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center overflow-hidden backdrop-blur-sm p-0 md:p-2">
      {/* ================================================================== */}
      {/* SELECTOR DE OPCIONES */}
      {/* ================================================================== */}

      {pendingProduct && (
        <OptionSelector
          product={pendingProduct}
          onClose={() => setPendingProduct(null)}
          onConfirm={(opts, notes) => addProduct(pendingProduct, opts, notes)}
        />
      )}

      <div className="bg-slate-50 w-full h-full max-w-[1600px] flex flex-col overflow-hidden shadow-2xl md:rounded-xl border border-slate-200">
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}

        <header className="h-11 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-600 rounded-lg text-white">
              <LayoutPanelLeft size={14} />
            </div>

            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Hunay <span className="text-emerald-600">POS</span>
              {mode === "EDIT" && (
                <span className="ml-2 text-slate-400">
                  · EDITANDO {editingOrder?.shortCode ?? ""}
                </span>
              )}
            </h2>
          </div>

          <button
            onClick={() => onCloseRef.current?.()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider"
          >
            <span>Salir (ESC)</span>

            <X size={12} />
          </button>
        </header>

        {/* ================================================================ */}
        {/* DESKTOP */}
        {/* ================================================================ */}

        <div className="hidden md:flex flex-1 w-full overflow-hidden">
          {/* ============================================================= */}
          {/* PRODUCTOS */}
          {/* ============================================================= */}

          <main className="w-3/5 h-full overflow-hidden bg-slate-100">
            <ProductPanel
              products={products}
              onProductClick={handleProductClickDirect}
              onProductCustomize={handleProductCustomize}
            />
          </main>

          {/* ============================================================= */}
          {/* ORDEN */}
          {/* ============================================================= */}

          <aside className="w-2/5 h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden z-20">
            <OrderPanel
              isSubmitting={isSubmitting}
              businessId={businessid}
              items={items}
              orderIdTemp={orderIdTemp}
              deliveryQuotationStatus={deliveryQuotationStatus}
              setDeliveryQuotationStatus={setDeliveryQuotationStatus}
              updateQty={updateQty}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              setDiscountType={setDiscountType}
              discountType={discountType}
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              subTotal={subTotal}
              updateItemNote={updateItemNote}
              createOrder={saveOrder}
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
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
            />
          </aside>
        </div>

        {/* ================================================================ */}
        {/* MOBILE */}
        {/* ================================================================ */}

        {/*
        <div className="flex-1 md:hidden overflow-hidden">
          <ProductPanel
            products={products}
            onProductClick={
              handleProductClickDirect
            }
            onProductCustomize={
              handleProductCustomize
            }
          />

          <OrderSheet
            businessId={businessid}
            items={items}
            isSubmitting={isSubmitting}
            updateQty={updateQty}
            createOrder={saveOrder}
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
            deliveryQuotationStatus={
              deliveryQuotationStatus
            }
            setDeliveryQuotationStatus={
              setDeliveryQuotationStatus
            }
            scheduledAt={scheduledAt}
            setScheduledAt={setScheduledAt}
          />
        </div>
        */}
      </div>
    </div>
  );
}
