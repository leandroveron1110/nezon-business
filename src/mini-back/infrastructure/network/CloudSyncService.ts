// infrastructure/network/CloudSyncService.ts
import { apiPatch, apiPost } from "@/lib/apiFetch";
import {
  Order,
  OrderItem,
  OrderOption,
  OrderOptionGroup,
  OrderThread,
} from "@/mini-back/core/orders/public";

export const cloudSyncService = {
  // Ahora recibe la orden completa (Entity/DTO)
  triggerImmediateSync: async (order: Order): Promise<string> => {
    // Mapeamos al formato que espera el Controller de NestJS
    // Usamos los datos que ya vienen en el objeto 'order'
    const syncDto = {
      businessId: order.businessId,
      userId: order.userId || null,
      customerName: order.customerName,
      customerPhone: order.customerPhone || "",
      total: order.total,
      totalDeliveryCost: order.totalDeliveryCost || 0,
      paymentExpected: null,
      paymentReceived: null,
      deliveryType: order.deliveryType,
      orderPaymentMethod: order.orderPaymentMethod,
      origin: order.origin, // O 'POS' según prefieras en el back

      // IMPORTANTE: Aseguramos que estos no sean undefined
      shortCode: order.shortCode || "S/N",
      dailyNumber: order.dailyNumber || 0,
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : undefined,

      items: order.items.map((item: OrderItem) => ({
        // CAMBIO: Usamos item.productId que es como se llama en tu interfaz OrderItem
        menuProductId: item.productId,
        productName: item.productName,
        productDescription: item.notes || "",
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        optionGroups: item.optionGroups.map((group: OrderOptionGroup) => ({
          groupName: group.groupName,
          // Mandamos defaults técnicos para que Prisma no explote
          minQuantity: 0,
          maxQuantity: 1,
          quantityType: "SINGLE",
          options: group.options.map((opt: OrderOption) => ({
            // CAMBIO: Usamos opt.optionId que es el nombre en tu interfaz
            opcionId: opt.optionId,
            optionName: opt.optionName,
            priceFinal: opt.priceFinal,
            quantity: opt.quantity,
          })),
        })),
      })),
    };

    // Usamos tu método genérico apiPost
    const res = await apiPost<{ id: string }>("/orders/sync-from-pos", syncDto);

    if (!res.success || !res.data) {
      throw new Error(
        res.error?.contextMessage || "Error al sincronizar con la nube",
      );
    }

    // Devolvemos el ID de Postgres
    return res.data.id;
  },

  triggerBatchSync: async (
    businessId: string,
    orders: Order[],
  ): Promise<{ idTemp: string; cloudId?: string }[]> => {
    // Mapeamos todo el lote al DTO masivo que espera NestJS
    const batchDto = {
      businessId,
      orders: orders.map((order) => ({
        idTemp: order.idTemp,
        businessId: order.businessId,
        userId: order.userId || null,
        customerName: order.customerName,
        customerPhone: order.customerPhone || "",
        total: order.total,
        totalDeliveryCost: order.totalDeliveryCost || 0,
        deliveryType: order.deliveryType,
        orderPaymentMethod: order.orderPaymentMethod,
        shortCode: order.shortCode || "S/N",
        dailyNumber: order.dailyNumber || 0,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        paymentExpected: {},
        paymentReceived: {},
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : undefined,
        items: order.items.map((item) => ({
          menuProductId: item.productId,
          productName: item.productName,
          productDescription: item.notes || "",
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          optionGroups: item.optionGroups.map((group) => ({
            groupName: group.groupName,
            minQuantity: 0,
            maxQuantity: 1,
            quantityType: "SINGLE",
            options: group.options.map((opt) => ({
              opcionId: opt.optionId,
              optionName: opt.optionName,
              priceFinal: opt.priceFinal,
              quantity: opt.quantity,
            })),
          })),
        })),
      })),
    };


    const res = await apiPost<
      {
        idTemp: string;
        cloudId?: string;
        status: "SUCCESS" | "ERROR";
        error?: string;
      }[]
    >("/orders/sync-batch", batchDto);

    if (!res.success || !res.data) {
      throw new Error(
        res.error?.contextMessage || "Error en sincronización masiva",
      );
    }

    // Retorna el array con [{ idTemp, cloudId }, ...]
    return res.data;
  },

  syncOrderStateEvents: async (events: any[]) => {
    try {
      // Mapeamos al formato exacto esperado por el DTO del backend
      const payload = {
        events: events.map((e) => ({
          orderId: e.orderId,
          stateType: e.stateType, // Ej: "ORDER", "PAYMENT", "DELIVERY"
          value: e.value,
          author: e.author || "SYSTEM",
          createdAt: new Date(e.createdAt).toISOString(),
        })),
      };

      const res = await apiPost<{
        success: boolean;
        processed: number;
        message: string;
      }>("/orders/events/sync", payload);

      if (!res.success || !res.data) {
        throw new Error(
          res.error?.contextMessage || "Error en sincronización masiva",
        );
      }

      // Retorna el array con [{ idTemp, cloudId }, ...]
      return res.data;
    } catch (error) {
      console.error("Error de red enviando eventos al servidor:", error);
      return false;
    }
  },

  updateOrder: async (
    orderId: string,
    updates: { thread: OrderThread; nextValue: string },
  ): Promise<boolean> => {
    try {
      if(updates.thread === "STATUS") {
        await apiPatch(`/orders/order/status/${orderId}`, { status: updates.nextValue });
      }else if(updates.thread === "PAYMENT") {
        await apiPatch(`/orders/order/payment-status/status/${orderId}`, { status: updates.nextValue });
      }else if(updates.thread === "DELIVERY") {
        // await apiPatch(`/order/delivery-status/${orderId}`, { deliveryStatus: updates.nextValue });
      }
      return true;
    } catch (error) {
      console.error("Error al actualizar estado en la nube:", error);
      return false;
    }
  },
};
