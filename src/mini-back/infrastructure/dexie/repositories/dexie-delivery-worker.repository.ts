import { db } from "../db";
import {
  DeliveryResolutionStrategy,
  LocalOrder,
} from "../shcema/orders.schema";

export interface CompleteDeliveryQuotationInput {
  idTemp: string;

  quotedCost: number;

  resolvedAddress: string;

  latitude?: number;
  longitude?: number;

  zoneId?: string | null;

  strategy: DeliveryResolutionStrategy;
}

export interface WaitingBaseInput {
  idTemp: string;

  quotationId: string;

  resolvedAddress: string;

  latitude?: number;
  longitude?: number;

  zoneId?: string | null;

  strategy: DeliveryResolutionStrategy;
}

export interface DeliveryWorkerRepository {
  /**
   * Devuelve todas las órdenes cuya cotización
   * todavía debe ser procesada.
   */
  findPendingQuotation(): Promise<LocalOrder[]>;

  /**
   * Devuelve todas las órdenes esperando respuesta de Base.
   */
  findWaitingBaseQuotation(): Promise<LocalOrder[]>;

  /**
   * Persiste una cotización resuelta automáticamente.
   */
  completeQuotation(input: CompleteDeliveryQuotationInput): Promise<void>;

  /**
   * Persiste una cotización resuelta manualmente por Base.
   */
  completeManualQuotation(input: {
    idTemp: string;
    quotedCost: number;
  }): Promise<void>;

  /**
   * Marca la orden como enviada a Base.
   */
  markWaitingBase(input: WaitingBaseInput): Promise<void>;

  /**
   * Marca la cotización como fallida.
   */
  markQuotationError(idTemp: string): Promise<void>;
}

export class DexieDeliveryWorkerRepository implements DeliveryWorkerRepository {
  async findPendingQuotation(): Promise<LocalOrder[]> {
    return db.orders
      .where("deliveryQuotationStatus")
      .equals("PENDING")
      .toArray();
  }

  async completeQuotation(
    input: CompleteDeliveryQuotationInput,
  ): Promise<void> {
    await db.orders.update(input.idTemp, {
      deliveryQuotationStatus: "RESOLVED",

      deliveryResolutionStrategy: input.strategy,

      totalDeliveryCost: input.quotedCost,

      resolvedAddress: input.resolvedAddress,

      latitude: input.latitude,

      longitude: input.longitude,

      zoneId: input.zoneId ? input.zoneId : undefined,

      syncedDelivery: false,

      updatedAt: new Date(),
    });
  }

  async markWaitingBase(input: WaitingBaseInput): Promise<void> {
    await db.orders.update(input.idTemp, {
      deliveryQuotationStatus: "WAITING_BASE",

      deliveryQuotationId: input.quotationId,

      deliveryResolutionStrategy: input.strategy,

      resolvedAddress: input.resolvedAddress,

      latitude: input.latitude,

      longitude: input.longitude,

      zoneId: input.zoneId ? input.zoneId : undefined,

      syncedDelivery: false,

      updatedAt: new Date(),
    });
  }

  async markQuotationError(idTemp: string): Promise<void> {
    await db.orders.update(idTemp, {
      deliveryQuotationStatus: "ERROR",

      syncedDelivery: false,

      updatedAt: new Date(),
    });
  }

  async findWaitingBaseQuotation(): Promise<LocalOrder[]> {
    return db.orders
      .where("deliveryQuotationStatus")
      .equals("WAITING_BASE")
      .toArray();
  }

  async completeManualQuotation(input: {
    idTemp: string;
    quotedCost: number;
  }): Promise<void> {
    await db.orders.update(input.idTemp, {
      deliveryQuotationStatus: "RESOLVED",

      totalDeliveryCost: input.quotedCost,

      syncedDelivery: false,

      updatedAt: new Date(),
    });
  }
}
