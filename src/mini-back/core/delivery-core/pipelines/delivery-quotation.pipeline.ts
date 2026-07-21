// src/core/delivery/pipelines/delivery-quotation.pipeline.ts

import { QuoteDeliveryInput } from "../inputs/quote-delivery.input";

import { DeliveryService } from "../service/delivery.service";
import { BaseQuotationService } from "../service/base-quotation.service";

export class DeliveryQuotationPipeline {
  constructor(
    private readonly automaticService: DeliveryService,
    private readonly baseService: BaseQuotationService,
  ) {}

  async execute(input: QuoteDeliveryInput) {
    // =====================================================
    // NIVEL 1
    // AUTOMÁTICO
    // =====================================================

    const automatic =
      await this.automaticService.quoteDelivery(input);

    if (
      automatic.success &&
      automatic.data?.quotationStatus === "RESOLVED"
    ) {
      return automatic;
    }

    // =====================================================
    // NIVEL 2
    // BASE DE CADETERÍA
    // =====================================================
    await this.baseService.quote({
        orderIdTemp: input.businessId,
        rawAddress: input.rawAddress,
        businessId: input.businessId,
      });

    // if (
    //   base.success &&
    //   base.data?.quotationStatus === "RESOLVED"
    // ) {
    //   return base;
    // }

  }
}