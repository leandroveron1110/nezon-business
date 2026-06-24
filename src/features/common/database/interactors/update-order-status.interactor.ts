import { 
  OrderStatus, 
  DeliveryStatus, 
  PaymentStatus, 
  canChangeOrderStatus, 
  canChangeDeliveryStatus,
  PAYMENT_TRANSITIONS 
} from "@/types/order-state-machine";
import { fetchUpdateOrdersByOrderID } from "@/features/order/api/catalog-api";
import { Origin } from "@/types/order";
import { db } from "@/mini-back/infrastructure/dexie/db";

// Definimos un tipo para saber qué hilo estamos actualizando
type OrderThread = 'STATUS' | 'PAYMENT' | 'DELIVERY';

export async function updateOrderStateInteractor(
  orderId: string, 
  thread: OrderThread, 
  newValue: OrderStatus | DeliveryStatus | PaymentStatus,
  origin: Origin
) {
  // 1. Obtener la orden de IndexedDB
  const localOrder = await db.orders.get(orderId);
  if (!localOrder) throw new Error("Orden no encontrada en la base de datos local.");

  // 2. Validar transición según el hilo (Soberanía de la Máquina de Estados)
  let isValid = false;
  let finalValueToUpdate = newValue;
  const updatePayload: any = { updatedAt: new Date() };

  switch (thread) {
    case 'STATUS':
const nextStatus = newValue as OrderStatus;
    if (
        localOrder.origin === "BUSINESS" && 
        nextStatus === OrderStatus.CONFIRMED
      ) {
        finalValueToUpdate = OrderStatus.PREPARING;
        localOrder.status = OrderStatus.CONFIRMED
      }
      isValid = canChangeOrderStatus(localOrder.status as OrderStatus, finalValueToUpdate as OrderStatus);
      if (!isValid) console.error(`Transición no permitida: ${finalValueToUpdate}`);
      
      updatePayload.status = finalValueToUpdate;
      break;
    
    case 'PAYMENT':
      // Validación simple para pagos usando el mapa de transiciones
      isValid = PAYMENT_TRANSITIONS[localOrder.paymentStatus as PaymentStatus]?.includes(newValue as PaymentStatus);
      updatePayload.paymentStatus = newValue;
      break;

    case 'DELIVERY':
      isValid = canChangeDeliveryStatus(newValue as DeliveryStatus, {
        status: localOrder.status as OrderStatus,
        deliveryStatus: localOrder.deliveryStatus as DeliveryStatus
      });
      updatePayload.deliveryStatus = newValue;
      break;
  }

  if (!isValid) {
    throw new Error(`Transición no permitida para el hilo ${thread}: ${newValue}`);
  }

  // 3. Actualización Atómica en IndexedDB (UI Optimista)
  // Cambiamos el syncStatus para que el worker sepa que hay cambios pendientes de envío
  const nextSyncStatus = localOrder.syncStatus === 'SYNC_PENDING' ? 'pending_creation' : 'pending_update';
  
  await db.orders.update(orderId, {
    ...updatePayload,
    syncStatus: nextSyncStatus
  });

  // 4. Lógica de Sincronización (Solo si tiene userId / es de plataforma)
  if (localOrder.userId || localOrder.id) {
    try {
      // console.log(`🚀 Sincronizando hilo ${thread}...`);
      
      // Aquí llamamos a tu API. Podés tener un endpoint genérico o específicos.
      // Si fetchUpdateOrdersByOrderID solo actualiza 'status', podrías necesitar otros
      const success = await fetchUpdateOrdersByOrderID(orderId, { [thread.toLowerCase()]: newValue });

      if (success) {
        await db.orders.update(orderId, { syncStatus: 'SYNCED' });
      }
    } catch (error) {
      console.error("❌ Falló la sincronización inmediata, quedará para el reintento del worker.");
      // No lanzamos error aquí para no romper la UX, el syncStatus ya está en 'SYNC_PENDING'
    }
  }

  return true;
}