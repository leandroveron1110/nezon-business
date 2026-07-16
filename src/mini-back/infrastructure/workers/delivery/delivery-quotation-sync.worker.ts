// src/mini-back/infrastructure/workers/delivery/delivery-quotation-sync.worker.ts

import { DexieDeliveryWorkerRepository } from "../../dexie/repositories/dexie-delivery-worker.repository";
import { fetchResolvedDeliveryQuotations } from "../../network/delivery-api";

export class DeliveryQuotationSyncWorker {
  constructor(
    private readonly repository: DexieDeliveryWorkerRepository,
  ) {}

  /**
   * Loop principal del worker.
   */
  async run(): Promise<void> {
    // Buscamos órdenes que siguen esperando una cotización manual.
    const waitingOrders = await this.repository.findWaitingBaseQuotation();

    if (!waitingOrders.length) {
      return;
    }

    // Todas las órdenes pertenecen al mismo negocio.
    const businessId = waitingOrders[0].businessId;

    console.log("''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''");
    console.log(waitingOrders);

    console.log(
      `[DeliveryQuotationSyncWorker] Buscando cotizaciones resueltas para ${waitingOrders.length} órdenes...`,
    );

    const quotations = await fetchResolvedDeliveryQuotations(businessId);

    if (!quotations.length) {
      return;
    }

    for (const quotation of quotations) {
      try {
        await this.process(quotation);
      } catch (error) {
        console.error(
          `[DeliveryQuotationSyncWorker] Error sincronizando cotización ${quotation.id}`,
          error,
        );
      }
    }
  }

  /**
   * Sincroniza una cotización resuelta con la orden local.
   */
  private async process(quotation: {
    orderId: string;
    quotedCost: number | null;
    destinationAddress: string;
  }): Promise<void> {
    if (quotation.quotedCost == null) {
      return;
    }

    console.log(
      `[DeliveryQuotationSyncWorker] Aplicando cotización a orden ${quotation.orderId}`,
    );

    await this.repository.completeManualQuotation({
      idTemp: quotation.orderId,
      quotedCost: quotation.quotedCost,
    });
  }
}

let quotationSyncWorker: DeliveryQuotationSyncWorker | null = null;

export function getDeliveryQuotationSyncWorker() {
  if (!quotationSyncWorker) {
    quotationSyncWorker = new DeliveryQuotationSyncWorker(
      new DexieDeliveryWorkerRepository(),
    );
  }

  return quotationSyncWorker;
}