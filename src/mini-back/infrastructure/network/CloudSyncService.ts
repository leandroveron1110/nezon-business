// infrastructure/network/CloudSyncService.ts
import { apiPost } from "@/lib/apiFetch";
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
      origin: "BUSINESS", // O 'POS' según prefieras en el back

      // IMPORTANTE: Aseguramos que estos no sean undefined
      shortCode: order.shortCode || "S/N",
      dailyNumber: order.dailyNumber || 0,

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

    console.log(`CloudSyncService: Enviando bloque de ${orders.length} órdenes para sincronización masiva. businessId: ${businessId} `);

    const res = await apiPost<{
      idTemp: string;
      cloudId?: string;
      status: 'SUCCESS' | 'ERROR';
      error?: string;
    }[]>("/orders/sync-batch", batchDto);

    if (!res.success || !res.data) {
      throw new Error(
        res.error?.contextMessage || "Error en sincronización masiva",
      );
    }

    // Retorna el array con [{ idTemp, cloudId }, ...]
    return res.data;
  },

  updateOrder: async (
    orderId: string,
    updates: { thread: OrderThread; nextValue: string },
  ): Promise<boolean> => {
    try {
      await apiPost(`/orders/${orderId}/update-status`, updates);
      return true;
    } catch (error) {
      console.error("Error al actualizar estado en la nube:", error);
      return false;
    }
  },
};
