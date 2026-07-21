// src/core/delivery/services/base-quotation.service.ts

import { RequestBaseQuotationInput } from "../inputs/request-base-quotation.input";
import { BaseHttpPort, DeliveryPersistencePort,  } from "../ports/base-quotation.port";

export class BaseQuotationService {
  constructor(
    private readonly persistence: DeliveryPersistencePort,
    private readonly http: BaseHttpPort,
  ) {}

  async quote(
    input: RequestBaseQuotationInput,
  ) {
    try {
      await this.http.submitQuotationRequest(input);

      await this.persistence.saveQuotationState(
        input.orderIdTemp,
        {
          quotationStatus: "PENDING",
          resolutionStrategy: "BASE",
        },
      );

      return {
        success: true,
        data: {
          quotationStatus: "PENDING",
          resolutionStrategy: "BASE",
        },
      };
    } catch {
      return {
        success: false,
        error: {
          code: "BASE_UNAVAILABLE",
          message:
            "No fue posible enviar la solicitud a Base.",
        },
      };
    }
  }
}
