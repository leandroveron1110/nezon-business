import { IOrderShortDto, DeliveryType } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";

export interface ISimplifiedFilter {
  label: string;
  condition: (order: IOrderShortDto) => boolean;
}

const isClosedLogistically = (o: IOrderShortDto) =>
  o.status === OrderStatus.COMPLETED ||
  o.status === OrderStatus.CANCELLED ||
  o.status === OrderStatus.REJECTED;

const isPaid = (o: IOrderShortDto) =>
  o.paymentStatus === PaymentStatus.CONFIRMED;

export const simplifiedFilters: ISimplifiedFilter[] = [
  {
    label: "Todos",

    // Todo lo que todavía requiere atención operativa
    // O financiera.
    //
    // Incluye:
    // - Pedidos activos
    // - Pedidos entregados pero NO cobrados
    // - Pedidos completed pero pendientes de pago
    //
    // Excluye:
    // - Cerrados + pagos
    // - Cancelados
    // - Rechazados

    condition: (o) => {
      // Cancelados/Rechazados desaparecen de la vista principal
      if (
        o.status === OrderStatus.CANCELLED ||
        o.status === OrderStatus.REJECTED
      ) {
        return false;
      }

      // Si no está pago → sigue activo visualmente
      if (!isPaid(o)) {
        return true;
      }

      // Si está pago pero todavía no terminó → sigue activo
      return o.status !== OrderStatus.COMPLETED;
    },
  },

  {
    label: "🚚 Delivery",

    condition: (o) =>
      o.deliveryType === DeliveryType.DELIVERY &&
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.REJECTED &&
      (
        // Sigue visible mientras no termine
        o.status !== OrderStatus.COMPLETED ||

        // O aunque esté completed si todavía no pagó
        !isPaid(o)
      ),
  },

  {
    label: "🛍️ Retiro",

    condition: (o) =>
      o.deliveryType === DeliveryType.PICKUP &&
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.REJECTED &&
      (
        o.status !== OrderStatus.COMPLETED ||
        !isPaid(o)
      ),
  },

  {
    label: "⚠️ Por Cobrar / Pendientes",

    // TODO lo no cobrado.
    //
    // Sin importar:
    // - completed
    // - entregado
    // - listo
    // - delivery finalizado
    //
    // Mientras falte plata:
    // → aparece acá.

    condition: (o) =>
      o.paymentStatus !== PaymentStatus.CONFIRMED &&
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.REJECTED,
  },

  {
    label: "✅ Cerrados",

    // SOLO:
    // - completados
    // - Y pagos
    //
    // O cancelados/rechazados

    condition: (o) =>
      (
        o.status === OrderStatus.COMPLETED &&
        isPaid(o)
      ) ||
      o.status === OrderStatus.CANCELLED ||
      o.status === OrderStatus.REJECTED,
  },
];