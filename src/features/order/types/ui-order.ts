// src/features/orders/types/ui-order.ts

import { DeliveryProvider } from "@/mini-back/core/orders-core/public";
import { IOrder } from "./order";

export interface UIOrder extends IOrder {
  id: string; // El id de Postgres
  idTemp: string;
  syncStatus: "pending" | "synced";
  deliveryProvider: DeliveryProvider;
}
