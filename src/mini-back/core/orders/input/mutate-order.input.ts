// src/core/orders/inputs/mutate-order.input.ts

import { OrderStatus, PaymentStatus, DeliveryStatus } from "../domain/order-state-machine";

export type CoreOrderThreadType = "ORDER" | "PAYMENT" | "DELIVERED" | "SYNC";
export type CoreOrderAuthorType = "SYSTEM" | "BUSINESS" | "CUSTOMER";

export type SyncStatusType = "SYNC_PENDING" | "LOCAL_ONLY" | "SYNCED" | "SYNC_ERROR";

// Definimos la base común para no repetir propiedades
type BaseMutateInput = {
  orderId: string;
  author: CoreOrderAuthorType;
};

// Mapeamos de forma estricta cada hilo con su respectivo enum o tipo literal
export type MutateOrderStateInput =
  | (BaseMutateInput & { thread: "ORDER"; nextValue: OrderStatus })
  | (BaseMutateInput & { thread: "PAYMENT"; nextValue: PaymentStatus })
  | (BaseMutateInput & { thread: "DELIVERED"; nextValue: DeliveryStatus })
  | (BaseMutateInput & { thread: "SYNC"; nextValue: SyncStatusType });