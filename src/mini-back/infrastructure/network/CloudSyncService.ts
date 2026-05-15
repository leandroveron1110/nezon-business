// infrastructure/network/CloudSyncService.ts
import { apiPost } from "@/lib/apiFetch";
import { Order, OrderItem, OrderOption, OrderOptionGroup,  } from "@/mini-back/core/orders/public";

export const cloudSyncService = {
  // Ahora recibe la orden completa (Entity/DTO)
  triggerImmediateSync: async (order: Order & { businessId: string }): Promise<string> => {
    
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
    origin: 'BUSINESS', // O 'POS' según prefieras en el back
    
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
        minQuantity:  0,
        maxQuantity: 1,
        quantityType: 'SINGLE',
        options: group.options.map((opt: OrderOption) => ({
          // CAMBIO: Usamos opt.optionId que es el nombre en tu interfaz
          opcionId: opt.optionId, 
          optionName: opt.optionName,
          priceFinal: opt.priceFinal,
          quantity: opt.quantity
        }))
      }))
    }))
  };

    // Usamos tu método genérico apiPost
    const res = await apiPost<any>('/orders/sync-from-pos', syncDto);

    if (!res.success || !res.data) {
      throw new Error(res.error?.contextMessage || "Error al sincronizar con la nube");
    }

    // Devolvemos el ID de Postgres
    return res.data.id;
  }
};


// ================================
// FRONT - CloudSyncService.ts
// ================================

interface IBusinessInfo {
  businessId: string;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessObservations?: string;
  businessAddresslatitude?: number;
  businessAddresslongitude?: number;
}

// export const cloudSyncService_ = {
//   triggerImmediateSync: async (
//     order: Order & { business: IBusinessInfo }
//   ): Promise<string> => {
    
//     // Snapshot COMPLETO
//     // El backend NO debe resolver nada.

//     const syncDto = {
//       // =========================
//       // IDS
//       // =========================
//       businessId: order.business.businessId,
//       userId: order.userId || null,

//       // =========================
//       // SNAPSHOTS CLIENTE
//       // =========================
//       customerName: order.customerName,
//       customerPhone: order.customerPhone || "",
//       customerAddress: order.customerAddress || null,
//       customerObservations: order.customerObservations || null,
//       customerAddresslatitude:
//         order.customerAddresslatitude || 0,
//       customerAddresslongitude:
//         order.customerAddresslongitude || 0,

//       // =========================
//       // SNAPSHOTS NEGOCIO
//       // =========================
//       businessName: order.businessName,
//       businessPhone: order.businessPhone,
//       businessAddress: order.businessAddress,
//       businessObservations:
//         order.businessObservations || null,
//       businessAddresslatitude:
//         order.businessAddresslatitude || 0,
//       businessAddresslongitude:
//         order.businessAddresslongitude || 0,

//       // =========================
//       // DELIVERY COMPANY
//       // =========================
//       deliveryCompanyId:
//         order.deliveryCompanyId || null,

//       deliveryCompanyName:
//         order.deliveryCompanyName || null,

//       deliveryCompanyPhone:
//         order.deliveryCompanyPhone || null,

//       // =========================
//       // TOTALES
//       // =========================
//       total: order.total,
//       totalDeliveryCost:
//         order.totalDeliveryCost || 0,

//       // =========================
//       // PAGOS
//       // =========================
//       paymentExpected:
//         order.paymentExpected || null,

//       paymentReceived:
//         order.paymentReceived || null,

//       paymentStatus: order.paymentStatus,

//       orderPaymentMethod:
//         order.orderPaymentMethod,

//       cadetPaymentPayer:
//         order.cadetPaymentPayer || null,

//       cadetPaymentMethod:
//         order.cadetPaymentMethod || null,

//       paymentReceiptUrl:
//         order.paymentReceiptUrl || null,

//       paymentInstructions:
//         order.paymentInstructions || null,

//       paymentHolderName:
//         order.paymentHolderName || null,

//       isCadetCollectingOrder:
//         order.isCadetCollectingOrder || false,

//       // =========================
//       // ESTADOS
//       // =========================
//       deliveryType: order.deliveryType,
//       deliveryStatus: order.deliveryStatus,
//       status: order.status,

//       // =========================
//       // META
//       // =========================
//       origin: "BUSINESS",
//       isTest: order.isTest || false,
//       notes: order.notes || null,

//       shortCode: order.shortCode || "S/N",
//       dailyNumber: order.dailyNumber || 0,

//       // =========================
//       // ITEMS
//       // =========================
//       items: order.items.map(
//         (item: OrderItem) => ({
//           menuProductId: item.productId,

//           productName: item.productName,

//           productDescription:
//             item.productDescription || null,

//           productImageUrl:
//             item.productImageUrl || null,

//           quantity: item.quantity,

//           priceAtPurchase:
//             item.priceAtPurchase,

//           notes: item.notes || null,

//           productPaymentMethod:
//             item.productPaymentMethod,

//           optionGroups:
//             item.optionGroups.map(
//               (group: OrderOptionGroup) => ({
//                 opcionGrupoId:
//                   group.opcionGrupoId || null,

//                 groupName: group.groupName,

//                 minQuantity:
//                   group.minQuantity,

//                 maxQuantity:
//                   group.maxQuantity,

//                 quantityType:
//                   group.quantityType,

//                 options: group.options.map(
//                   (opt: OrderOption) => ({
//                     opcionId:
//                       opt.optionId || null,

//                     optionName:
//                       opt.optionName,

//                     priceFinal:
//                       opt.priceFinal,

//                     priceWithoutTaxes:
//                       opt.priceWithoutTaxes,

//                     taxesAmount:
//                       opt.taxesAmount,

//                     priceModifierType:
//                       opt.priceModifierType,

//                     quantity:
//                       opt.quantity,
//                   })
//                 ),
//               })
//             ),
//         })
//       ),
//     };

//     const res = await apiPost<any>(
//       "/orders/sync-from-pos",
//       syncDto
//     );

//     if (!res.success || !res.data) {
//       throw new Error(
//         res.error?.contextMessage ||
//           "Error sincronizando orden"
//       );
//     }

//     return res.data.id;
//   },
// };