import { UIOrder } from "@/features/order/types/ui-order";
import { LocalOrder } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { DeliveryType, PaymentMethodType } from "@/types/order";
import { OrderStatus } from "@/types/order-state-machine";

export class OrderUiMapper {
  static toUI(local: LocalOrder): UIOrder {
    return {
      // 1. Identificadores y Sync (UIOrder)
      id: local.id || local.idTemp, // El modal usa 'id' para todo, pero Hunay sabe cuál es cuál
      idTemp: local.idTemp,
      syncStatus: local.syncStatus === "SYNCED" ? "synced" : "pending",

      // 2. Mapeo a IOrder (La interfaz base que espera el modal)
      businessId: "", // Si no lo guardamos en LocalOrder, lo inicializamos o lo sacamos de otro lado
      userId: "", // Idem
      deliveryCompanyId: null,
      status: local.status as OrderStatus,
      origin: local.origin,
      isTest: false,
      deliveryProvider: local.deliveryProvider,
      total: local.total,
      totalDeliveryCost: local.totalDeliveryCost,
      notes: local.customerObservations || "",
      createdAt: local.createdAt.toISOString(), // IndexedDB (Date) -> UI (String ISO)
      updatedAt: local.updatedAt.toISOString(),
      deliveryType: local.deliveryType as DeliveryType,
      orderPaymentMethod: local.orderPaymentMethod as PaymentMethodType,
      paymentStatus: local.paymentStatus,
      deliveryStatus: local.deliveryStatus,

      // 3. Reconstrucción de Objetos Anidados para la UI
      user: {
        id: "",
        fullName: local.customerName,
        phone: local.customerPhone,
        address: local.customerAddress,
      },

      bussiness: {
        name: "", // Si el negocio es fijo, podrías traerlo de un config o guardarlo en LocalOrder
        address: "",
        phone: "",
      },

      // 4. Mapeo de Items y Opciones
      items: local.items.map((item) => ({
        id: crypto.randomUUID(), // Generamos uno para que el .map() de React tenga key
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        notes: item.notes || null,
        productPaymentMethod: "CASH", // Default
        optionGroups: item.optionGroups.map((group) => ({
          id: crypto.randomUUID(),
          groupName: group.groupName,
          minQuantity: 0,
          maxQuantity: 10,
          quantityType: "MULTIPLE",
          options: group.options.map((opt) => ({
            id: opt.optionId || crypto.randomUUID(),
            optionName: opt.optionName,
            priceFinal: opt.priceFinal,
            quantity: opt.quantity,
            priceWithoutTaxes: opt.priceFinal,
            taxesAmount: 0,
            priceModifierType: "ABSOLUTE",
          })),
        })),
      })),
    };
  }
}
