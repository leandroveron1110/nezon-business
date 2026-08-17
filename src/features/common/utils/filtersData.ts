import { IOrderShortDto, DeliveryType } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";

export interface ISimplifiedFilter {
  label: string;
  condition: (order: IOrderShortDto) => boolean;
}

/**
 * Normaliza cualquier fecha/timestamp al final del día de HOY (23:59:59.999)
 */
const getEndOfToday = (): number => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
};

/**
 * Parsea scheduledAt de manera segura a milisegundos
 */
const parseScheduledDate = (scheduledAt?: string | Date | number | null): number | null => {
  if (!scheduledAt) return null;
  const parsed = new Date(scheduledAt).getTime();
  return isNaN(parsed) ? null : parsed;
};

/**
 * Determina si la orden es de entrega programada (de cualquier día).
 */
const isScheduledOrder = (o: IOrderShortDto): boolean => {
  return Boolean(parseScheduledDate(o.scheduledAt));
};

/**
 * Determina si un pedido es programado PARA UN DÍA FUTURO (después de las 23:59:59 de hoy)
 */
const isFutureDayScheduled = (o: IOrderShortDto): boolean => {
  const scheduledTime = parseScheduledDate(o.scheduledAt);
  if (!scheduledTime) return false;

  return scheduledTime > getEndOfToday();
};

const isPaid = (o: IOrderShortDto) =>
  o.paymentStatus === PaymentStatus.CONFIRMED;

const isCancelled = (o: IOrderShortDto) =>
  o.status === OrderStatus.CANCELLED ||
  o.status === OrderStatus.REJECTED;

/**
 * Orden lista, cobrada y esperando entrega/retiro.
 */
const isReadyToDeliver = (o: IOrderShortDto) =>
  isPaid(o) &&
  o.status === OrderStatus.READY;

/**
 * Orden que CORRESPONDE TRABAJAR HOY (Inmediatas + Programadas de hoy).
 * Excluye solo las programadas para mañana en adelante.
 */
const isActiveForToday = (o: IOrderShortDto) =>
  !isCancelled(o) &&
  !isReadyToDeliver(o) &&
  o.status !== OrderStatus.COMPLETED &&
  !isFutureDayScheduled(o);

export const simplifiedFilters: ISimplifiedFilter[] = [
  {
    label: "Activos",
    condition: (o) => isActiveForToday(o),
  },

  {
    label: "Programados",
    condition: (o) =>
      !isCancelled(o) &&
      o.status !== OrderStatus.COMPLETED &&
      isScheduledOrder(o), // Muestra TODOS los programados (de hoy y de días futuros)
  },

  {
    label: "Por Entregar",
    condition: (o) => isReadyToDeliver(o),
  },

  {
    label: "Delivery",
    condition: (o) =>
      o.deliveryType === DeliveryType.DELIVERY &&
      isActiveForToday(o),
  },

  {
    label: "Retiro",
    condition: (o) =>
      o.deliveryType === DeliveryType.PICKUP &&
      isActiveForToday(o),
  },

  {
    label: "Por Cobrar",
    condition: (o) =>
      !isPaid(o) &&
      !isCancelled(o),
  },

  {
    label: "Cerrados",
    condition: (o) =>
      o.status === OrderStatus.COMPLETED &&
      isPaid(o),
  },

  {
    label: "Cancelados / Rechazados",
    condition: (o) => isCancelled(o),
  },
];