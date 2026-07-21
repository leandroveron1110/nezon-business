// core/orders/domain/rules/sync-policy.ts
import { DeliveryStatus } from "../order-state-machine";
import { DeliveryProvider, Origin } from "../order.entity";

// Esta clase encapsula la lógica de negocio para determinar la prioridad de sincronización de una orden
export class SyncPolicy {
  /**
   * Determina si un cambio de estado debe enviarse YA al servidor
   * o si puede esperar al proceso de fondo.
   */
  static mustSyncImmediately(order: { origin: Origin; deliveryProvider: DeliveryProvider, deliveryStatus: DeliveryStatus }): boolean {
    // REGLA 1: Pedidos que vienen de la APP (Cliente final) -> Prioridad Alta
    // (Porque el cliente está mirando su pantalla esperando el cambio de estado)
    if (order.origin === "APP") return true;

    // REGLA 2: Pedidos con Logística de PLATAFORMA -> Prioridad Alta
    // (Porque el sistema de cadetería externo necesita saber cuándo está READY)
    if (order.deliveryProvider === "PLATFORM" && order.deliveryStatus !== DeliveryStatus.NOT_APPLICABLE) return true;

    // REGLA 3: Todo lo creado por el LOCAL (POS/Venta Mostrador) -> Prioridad Baja
    // (No saturamos el servidor, el local es el dueño de la verdad en su Dexie)
    return false;
  }
}