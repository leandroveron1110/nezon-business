import { IOrderShortDto, DeliveryType } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";

export interface ISimplifiedFilter {
  label: string;
  condition: (order: IOrderShortDto) => boolean;
}

const isPaid = (o: IOrderShortDto) =>
  o.paymentStatus === PaymentStatus.CONFIRMED;

const isCancelled = (o: IOrderShortDto) =>
  o.status === OrderStatus.CANCELLED ||
  o.status === OrderStatus.REJECTED;


/**
 * Orden lista, cobrada y esperando solamente entrega/retiro.
 */
const isReadyToDeliver = (o: IOrderShortDto) =>
  isPaid(o) &&
  o.status === OrderStatus.READY;


/**
 * Orden que todavía necesita trabajo.
 */
const isActive = (o: IOrderShortDto) =>
  !isCancelled(o) &&
  !isReadyToDeliver(o) &&
  o.status !== OrderStatus.COMPLETED;


export const simplifiedFilters: ISimplifiedFilter[] = [
  {
    label: "Activos",

    condition: (o) =>
      isActive(o),
  },


  {
    label: "Por Entregar",

    condition: (o) =>
      isReadyToDeliver(o),
  },


  {
    label: "Delivery",

    condition: (o) =>
      o.deliveryType === DeliveryType.DELIVERY &&
      isActive(o),
  },


  {
    label: "Retiro",

    condition: (o) =>
      o.deliveryType === DeliveryType.PICKUP &&
      isActive(o),
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

    condition: (o) =>
      isCancelled(o),
  },
];