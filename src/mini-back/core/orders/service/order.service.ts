// src/core/orders/order.service.ts

import { CreateOrderInput } from "../input/create-order.input";
import {
  CoreOrderStateEvent,
  OrderRepositoryPort,
} from "../ports/order-repository.port";
import { Order } from "../domain/order.entity";
import { OrderIdentityService } from "./order-identity.service";
import {
  IOrderPublicService,
  OrderServiceResponse,
} from "../public/order-service.interface";
import { OrderIdentityPort } from "../ports/order-identity.port";
import { UpdateOrderStatusInput } from "../input/update-order-status.input";
import { OrderStateMachine } from "../domain/rules/order-state-machine";
import { SyncPolicy } from "../domain/rules/sync-policy";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "../domain/order-state-machine";
import {
  CoreOrderThreadType,
  MutateOrderStateInput,
} from "../input/mutate-order.input";

export class OrderService implements IOrderPublicService {
  constructor(
    private readonly repository: OrderRepositoryPort,
    private readonly identityPort: OrderIdentityPort,
  ) {}

  async mutateState(
    input: MutateOrderStateInput,
  ): Promise<OrderServiceResponse> {
    // 1. Buscar la orden por su identificador temporal local (idTemp)
    const order = await this.repository.findByIdTemp(input.orderId);
    if (!order) {
      return {
        success: false,
        error: {
          code: "REPOSITORY_ERROR",
          message: "No se encontró la orden especificada.",
        },
      };
    }

    let isValid = false;
    let finalValueToUpdate: string = input.nextValue;
    const updates: Partial<Order> = { updatedAt: new Date() };
    let currentStatusForValidation = order.status;

    // 🔥 DETECTAMOS EXIGENCIA DE SYNC: Regla soberana basada en el Origen o la Prioridad establecida
    const exigeSyncInmediata =
      order.origin === "APP" || order.syncPriority === "HIGH";

    // 2. Orquestar las validaciones del Negocio según el hilo (Thread)
    // Gracias al Discriminated Union, TypeScript infiere el tipo exacto de nextValue en cada bloque
    switch (input.thread) {
      case "ORDER": {
        const nextStatus = input.nextValue; // Inferred como OrderStatus

        // Regla de negocio: Si viene de mostrador (BUSINESS) y pasa a CONFIRMED, salta directo a PREPARING
        if (
          order.origin === "BUSINESS" &&
          nextStatus === OrderStatus.CONFIRMED
        ) {
          finalValueToUpdate = OrderStatus.PREPARING;
          currentStatusForValidation = OrderStatus.CONFIRMED;
        }

        isValid = OrderStateMachine.canChangeStatus(
          currentStatusForValidation,
          finalValueToUpdate as OrderStatus,
        );

        updates.status = finalValueToUpdate as OrderStatus;
        updates.syncedStatus = exigeSyncInmediata ? false : true;
        break;
      }

      case "PAYMENT": {
        // input.nextValue es inferred automáticamente como PaymentStatus
        isValid = OrderStateMachine.canChangePayment(
          order.paymentStatus,
          input.nextValue,
        );
        updates.paymentStatus = input.nextValue;
        updates.syncedPayment = exigeSyncInmediata ? false : true;
        break;
      }

      case "DELIVERY": {
        // input.nextValue es inferred automáticamente como DeliveryStatus
        isValid = OrderStateMachine.canChangeDelivery(input.nextValue, order);
        updates.deliveryStatus = input.nextValue;
        updates.syncedDelivery = exigeSyncInmediata ? false : true;
        break;
      }

      case "SYNC": {
        // input.nextValue es inferred automáticamente como SyncStatusType.
        // Ya no hace falta el array .includes() en ejecución porque el compilador no deja meter otra cosa.
        isValid = true;

        updates.syncStatus = input.nextValue;

        // Si el orquestador o el worker nos confirman un 'SYNCED' exitoso desde la infraestructura,
        // re-confirmamos la coherencia del Core poniendo todos los hilos comerciales en true.
        if (input.nextValue === "SYNCED") {
          updates.syncedStatus = true;
          updates.syncedPayment = true;
          updates.syncedDelivery = true;
        }
        break;
      }
    }

    // Si el negocio o la validación del hilo deniega la transición, se frena el flujo.
    if (!isValid) {
      return {
        success: false,
        error: {
          code: "LOGISTICS_ERROR",
          message: `Transición de estado no permitida para el hilo ${input.thread}`,
        },
      };
    }

    // 3. Control de sincronización local/nube (Estrategia offline inteligente)
    if (input.thread !== "SYNC") {
      updates.syncStatus = exigeSyncInmediata ? "SYNC_PENDING" : "LOCAL_ONLY";
    }

    // 4. Construir el evento de historial sin ID físico
    const stateEvent: CoreOrderStateEvent = {
      idTemp: order.idTemp,
      orderId: order.id || null,
      stateType: input.thread,
      value: finalValueToUpdate,
      author: input.author,
      createdAt: new Date(),
    };

    // 5. Persistencia atómica y coordinada mediante el puerto de repositorio
    await this.repository.updateStatuses(order.idTemp, updates);
    await this.repository.saveOrderEvent(stateEvent);

    return {
      success: true,
      data: { ...order, ...updates } as Order,
    };
  }

  async createOrder(input: CreateOrderInput): Promise<OrderServiceResponse> {
    const identityService = new OrderIdentityService(this.identityPort);
    const nextNumber = await identityService.generate(input.origin);

    const initialStatus = input.instantPrepare
      ? OrderStatus.PREPARING
      : OrderStatus.PENDING;

    const isHighPriority = SyncPolicy.mustSyncImmediately({
      origin: input.origin,
      deliveryProvider: input.deliveryProvider,
      deliveryStatus: input.deliveryStatus,
    });

    const order: Order = {
      idTemp: input.idTemp,
      businessId: input.businessId,
      syncStatus: isHighPriority ? "SYNC_PENDING" : "LOCAL_ONLY",
      syncPriority: isHighPriority ? "HIGH" : "LOW",
      customerName: input.customerName?.trim() || nextNumber.shortCode,
      customerPhone: input.customerPhone || "",
      customerAddress: input.customerAddress,
      customerObservations: input.customerObservations,
      total: input.total,
      deliveryType: input.deliveryType,
      deliveryProvider: input.deliveryProvider,
      deliveryPriceMode:
        input.deliveryProvider === "INTERNAL" ? "MANUAL" : "AUTOMATIC",
      totalDeliveryCost:
        input.deliveryType === "DELIVERY" ? input.totalDeliveryCost : 0,
      orderPaymentMethod: input.orderPaymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      deliveryStatus:
        input.deliveryType === "DELIVERY"
          ? DeliveryStatus.PENDING
          : DeliveryStatus.NOT_APPLICABLE,
      status: initialStatus,
      origin: input.origin,
      items: input.items,

      // Al crearse de cero, todo nace listo para procesar según la urgencia inicial
      syncedStatus: isHighPriority ? false : true,
      syncedPayment: isHighPriority ? false : true,
      syncedDelivery: isHighPriority ? false : true,

      shortCode: nextNumber.shortCode,
      dailyNumber: nextNumber.nextNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.save(order);

    // console.log("Orden creada en Dexie con idTemp:", order.idTemp);

    const creationEvent: CoreOrderStateEvent = {
      idTemp: order.idTemp,
      orderId: null,
      stateType: "ORDER",
      value: initialStatus,
      author: "BUSINESS",
      createdAt: order.createdAt,
    };

    await this.repository.saveOrderEvent(creationEvent);

    // console.log(
    //   "Evento de creación de orden guardado en Dexie para idTemp:",
    //   order.idTemp,
    // );

    return {
      success: true,
      data: order,
    };
  }

  async updateStatus(
    input: UpdateOrderStatusInput,
  ): Promise<OrderServiceResponse> {
    const baseConfig = {
      orderId: input.idTemp,
      author: "BUSINESS" as const, // Forzamos el literal exacto
    };

    switch (input.thread) {
      case "STATUS":
        return this.mutateState({
          ...baseConfig,
          thread: "ORDER",
          nextValue: input.nextValue as OrderStatus,
        });

      case "PAYMENT":
        return this.mutateState({
          ...baseConfig,
          thread: "PAYMENT",
          nextValue: input.nextValue as PaymentStatus,
        });

      case "DELIVERY":
        return this.mutateState({
          ...baseConfig,
          thread: "DELIVERY",
          nextValue: input.nextValue as DeliveryStatus,
        });

      default:
        return {
          success: false,
          error: {
            code: "INVALID_THREAD",
            message: `El hilo '${input.thread}' no está soportado externamente.`,
          },
        };
    }
  }

  async notifySyncError(idTemp: string): Promise<void> {
    await this.mutateState({
      orderId: idTemp,
      thread: "SYNC",
      nextValue: "SYNC_ERROR",
      author: "SYSTEM",
    });
  }

  async confirmCloudSync(idTemp: string, cloudId: string): Promise<void> {
    const updates: Partial<Order> = {
      id: cloudId,
      updatedAt: new Date(),
    };
    await this.repository.updateStatuses(idTemp, updates);

    await this.mutateState({
      orderId: idTemp,
      thread: "SYNC",
      nextValue: "SYNCED",
      author: "SYSTEM",
    });
  }
}
