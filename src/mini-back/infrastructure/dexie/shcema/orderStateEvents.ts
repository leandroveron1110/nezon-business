// src/common/database/shcema/orderStateEvents.ts

type stateType = "ORDER" | "PAYMENT" | "DELIVERY" | "SYNC";
type syncStatus = "PENDING" | "SYNCED" | "FAILED";
type authorType = "SYSTEM" | "BUSINESS" | "CUSTOMER";

export interface OrderStateEvent {
  id: string;             // UUID local único por cada mutación (PK real).
  idTemp: string;         // ID temporal de la orden dueña del evento.
  orderId: string | null; // ID definitivo de Postgres (Null hasta que se cree en la nube).
  stateType: stateType;
  value: string;          // Ej: "PAID", "DELIVERED", "PREPARING".
  syncStatus: syncStatus; // PENDING cuando ocurre en el core local, SYNCED tras el 200 OK.
  author: authorType;
  createdAt: Date;
}

export const ORDER_STATE_EVENTS_STORE = 'id, idTemp, syncStatus';