// src/core/delivery/ports/base-quotation.port.ts

import { RequestBaseQuotationInput } from "../inputs/request-base-quotation.input";
import { DeliveryQuotationStatus, DeliveryResolutionStrategy } from "../public";

export interface DeliveryPersistencePort {
  saveQuotationState(
    orderIdTemp: string,
    state: {
      quotationStatus: DeliveryQuotationStatus;
      resolutionStrategy: DeliveryResolutionStrategy;
    }
  ): Promise<void>;
  getOrder(orderIdTemp: string): Promise<boolean>;
}

export interface BaseHttpPort {
  submitQuotationRequest(
    input: RequestBaseQuotationInput,
  ): Promise<void>;
}