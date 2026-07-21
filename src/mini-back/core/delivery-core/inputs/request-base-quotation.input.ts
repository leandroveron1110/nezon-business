// src/core/delivery/inputs/request-base-quotation.input.ts

export interface RequestBaseQuotationInput {
  businessId: string;

  orderIdTemp: string;

  rawAddress: string;

  customerName?: string;

  customerPhone?: string;
}