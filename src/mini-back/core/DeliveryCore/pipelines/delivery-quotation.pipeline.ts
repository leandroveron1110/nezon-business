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

    // const base =
    //   await this.baseService.quote(input);

    // if (
    //   base.success &&
    //   base.data?.quotationStatus === "RESOLVED"
    // ) {
    //   return base;
    // }

    // =====================================================
    // NIVEL 3
    // MANUAL
    // =====================================================

    return {
      success: true,
      data: {
        quotationStatus: "MANUAL",

        resolutionStrategy: "MANUAL",

        quotedCost: null,

        requiresManualPrice: true,

        latitude: undefined,
        longitude: undefined,

        zoneId: null,

        resolvedAddress: input.rawAddress,
      },
    };
  }
}