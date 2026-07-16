import { IOrderShortDto, DeliveryType } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/types/order-state-machine";

export interface ISimplifiedFilter {
  label: string;
  condition: (order: IOrderShortDto) => boolean;
}

const isPaid = (o: IOrderShortDto) =>
  o.paymentStatus === PaymentStatus.CONFIRMED;

export const simplifiedFilters: ISimplifiedFilter[] = [
  {
    label: "Activos",

    condition: (o) => {
      if (
        o.status === OrderStatus.CANCELLED ||
        o.status === OrderStatus.REJECTED
      ) {
        return false;
      }

      if (!isPaid(o)) {
        return true;
      }

      return o.status !== OrderStatus.COMPLETED;
    },
  },

  {
    label: "Delivery",

    condition: (o) =>
      o.deliveryType === DeliveryType.DELIVERY &&
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.REJECTED &&
      (o.status !== OrderStatus.COMPLETED || !isPaid(o)),
  },

  {
    label: "Retiro",

    condition: (o) =>
      o.deliveryType === DeliveryType.PICKUP &&
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.REJECTED &&
      (o.status !== OrderStatus.COMPLETED || !isPaid(o)),
  },

  {
    label: "Por Cobrar",

    condition: (o) =>
      o.paymentStatus !== PaymentStatus.CONFIRMED &&
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.REJECTED,
  },

  {
    label: "Cerrados",

    condition: (o) => o.status === OrderStatus.COMPLETED && isPaid(o),
  },

  {
    label: "Cancelados / Rechazados",

    condition: (o) =>
      o.status === OrderStatus.CANCELLED || o.status === OrderStatus.REJECTED,
  },
];
