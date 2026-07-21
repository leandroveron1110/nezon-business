// src/mini-back/infrastructure/workers/delivery/delivery.worker.ts

import { LOCATION_DATA } from "@/data/location-search-data";

import { createDeliveryService } from "../../factories/create-delivery-service";

import { DeliveryQuotation } from "@/mini-back/core/delivery-core/signal/delivery-quotation";
import { DexieDeliveryWorkerRepository } from "../../dexie/repositories/dexie-delivery-worker.repository";
import { LocalOrder } from "../../dexie/shcema/orders.schema";
import { requestDeliveryQuotation } from "../../network/delivery-api";
import { getDeliveryQuotationSyncWorker } from "./delivery-quotation-sync.worker";
import { BusinessLocalRepository } from "../../dexie/repositories/dexie-business.repository";

export class DeliveryWorker {
  constructor(
    private readonly repository: DexieDeliveryWorkerRepository,
    private readonly deliveryService: ReturnType<typeof createDeliveryService>,
  ) {}

  /**
   * Loop principal del worker
   */
  async run(): Promise<void> {
    const orders = await this.repository.findPendingQuotation();

    console.log(
      `[DeliveryWorker] Procesando ${orders.length} órdenes pendientes de cotización...`,
    );

    for (const order of orders) {
      try {
        await this.process(order);
      } catch (error) {
        console.error(
          `[DeliveryWorker] Error procesando orden ${order.idTemp}`,
          error,
        );
      }
    }
  }

  /**
   * Pipeline principal de delivery
   */
  private async process(order: LocalOrder): Promise<void> {
    if (!order.customerAddress) return;

    console.log(
      `[DeliveryWorker] Procesando cotización para orden ${order.idTemp} con dirección: ${order.customerAddress}`,
    );
    const quotation = await this.deliveryService.quoteDelivery({
      rawAddress: order.customerAddress,
      businessId: order.businessId,
      provider: order.deliveryProvider,
      locations: LOCATION_DATA,
    });

    console.log(
      `[DeliveryWorker] Cotización para orden ${order.idTemp}:`,
      quotation,
    );
    if (!quotation.success || !quotation.data) {
      console.log(
        `[DeliveryWorker] Error en cotización para orden ${order.idTemp}:`,
        quotation.error,
      );
      await this.sendToBase(order, {
        quotationStatus: "MANUAL",
        resolutionStrategy: "MANUAL",
        quotedCost: null,
        requiresManualPrice: true,
        resolvedAddress: order.customerAddress,
        latitude: order.latitude,
        longitude: order.longitude,
        zoneId: order.zoneId,
      });
      return;
    }

    const data = quotation.data;

    if (data.quotationStatus === "RESOLVED") {
      await this.repository.completeQuotation({
        idTemp: order.idTemp,
        quotedCost: data.quotedCost!,
        resolvedAddress: data.resolvedAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        zoneId: data.zoneId,
        strategy: data.resolutionStrategy,
      });
      return;
    }

    await this.sendToBase(order, data);
  }

  /**
   * Envía solicitud de cotización a Base (operador humano)
   */
  private async sendToBase(
    order: LocalOrder,
    quotation: DeliveryQuotation,
  ): Promise<void> {
    console.log(
      `[DeliveryWorker] Enviando solicitud de cotización a Base para orden ${order.idTemp} con dirección: ${order.customerAddress}`,
    );
    const businessDiex = new BusinessLocalRepository();
    const business = await businessDiex.getCurrentBusiness();
    const response = await requestDeliveryQuotation({
      businessId: order.businessId,

      originName: business?.name || "",
      originAddress: business?.address || "",
      originLatitude: business?.latitude,
      originLongitude: business?.longitude,

      orderId: order.idTemp,

      customerAddress: order.customerAddress!,
    });

    if (response) {
      /**
       * IMPORTANTE:
       * Base no responde el precio aquí.
       * Solo confirma recepción de la solicitud.
       */
      await this.repository.markWaitingBase({
        idTemp: order.idTemp,

        quotationId: order.idTemp, // usamos orderId como correlación natural

        resolvedAddress: quotation.resolvedAddress,

        latitude: quotation.latitude,

        longitude: quotation.longitude,

        zoneId: quotation.zoneId,

        strategy: quotation.resolutionStrategy,
      });
    }
  }
}

let deliveryWorker: DeliveryWorker | null = null;

export function getDeliveryWorker() {
  if (!deliveryWorker) {
    deliveryWorker = new DeliveryWorker(
      new DexieDeliveryWorkerRepository(),
      createDeliveryService(),
    );
  }

  return deliveryWorker;
}

export class DeliveryWorkerScheduler {
  private intervalId?: number;
  private running = false;

  start() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.running = true;
      this.run();
    });

    this.intervalId = window.setInterval(() => {
      this.run();
    }, 30000);
  }

  async run() {
    if (this.running) return;

    this.running = true;

    try {
      const worker = getDeliveryWorker();
      const quotationWorker = getDeliveryQuotationSyncWorker();
      await worker.run();
      await quotationWorker.run();
    } finally {
      this.running = false;
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

let schedulerStarted = false;

export function initSchedulers() {
  if (schedulerStarted) return;

  schedulerStarted = true;

  const scheduler = new DeliveryWorkerScheduler();
  scheduler.start();
}
