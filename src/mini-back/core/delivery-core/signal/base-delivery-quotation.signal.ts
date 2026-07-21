// src/core/delivery/signal/base-delivery-quotation.signal.ts

export interface BaseDeliveryQuotation {
  quotationStatus: "RESOLVED" | "PENDING" | "ERROR";

  quotedCost: number | null;

  quotationId?: string;

  source: "BASE";
}