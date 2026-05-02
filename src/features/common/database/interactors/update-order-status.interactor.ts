import { canTransition, OrderStatus } from "@/types/order";
import { db } from "..";
import { fetchUpdateOrdersByOrderID } from "@/features/order/api/catalog-api";


// src/features/orders/interactors/update-order-status.interactor.ts

export async function updateOrderStatusInteractor(orderId: string, newStatus: OrderStatus) {
  // 1. Obtener la orden (Validación de existencia)
  const localOrder = await db.orders.get(orderId);
  if (!localOrder) throw new Error("Orden no encontrada.");

  // 2. Validar transición (La máquina de estados manda)
  if (!canTransition(localOrder.status as OrderStatus, newStatus)) {
    throw new Error(`Acción no permitida: ${localOrder.status} -> ${newStatus}`);
  }

  // 3. Actualización Atómica en IndexedDB
  // Esto garantiza que la UI se actualice aunque no haya internet
  await db.orders.update(orderId, {
    status: newStatus,
    updatedAt: new Date(),
    syncStatus: localOrder.syncStatus === 'pending_creation' ? 'pending_creation' : 'pending_update'
  });

  // 4. Lógica de Sincronización Inteligente
  if (localOrder.userId) {
    // Es un pedido de la plataforma (Cliente esperando)
    // Lo enviamos YA mismo sin bloquear el hilo principal (no usamos await aquí)
    console.log("🚀 Prioridad Alta: Enviando actualización al servidor...");
    const rest  = await fetchUpdateOrdersByOrderID(orderId, newStatus);
    if(rest) {
        await db.orders.update(orderId, { syncStatus: 'synced' });
    }

  } else {
    // Es un pedido local/manual
    // No hacemos nada; el worker de fondo lo levantará en su próxima pasada "lenta"
    console.log("⏳ Prioridad Baja: Guardado localmente, se sincronizará luego.");
  }

  return true;
}
