import { CreateOrderInput } from "../input/create-order.input";

import { OrderRepositoryPort } from "../ports/order-repository.port";
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

export class OrderService implements IOrderPublicService {
  constructor(
    private readonly repository: OrderRepositoryPort,
    private readonly identityPort: OrderIdentityPort,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<OrderServiceResponse> {
    const identityService = new OrderIdentityService(this.identityPort);
    const nextNumber = await identityService.generate(input.origin);

    const isHighPriority = SyncPolicy.mustSyncImmediately({
      origin: input.origin,
      deliveryProvider: input.deliveryProvider,
      deliveryStatus: input.deliveryStatus
    });

    console.log(`Sync Policy evaluada. isHighPriority: ${isHighPriority}`);
    console.log(`Sync Policy evaluada. origin: ${input.origin}, deliveryProvider: ${input.deliveryProvider}, deliveryStatus: ${input.deliveryStatus}`);

    const order: Order = {
      idTemp: input.idTemp,

      id: null,

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

      status: input.instantPrepare
        ? OrderStatus.PREPARING
        : OrderStatus.PENDING,

      origin: input.origin,

      items: input.items,

      shortCode: nextNumber.shortCode,

      dailyNumber: nextNumber.nextNumber,

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    await this.repository.save(order);

    return {
      success: true,
      data: order,
    };
  }

  async updateStatus(
    input: UpdateOrderStatusInput,
  ): Promise<OrderServiceResponse> {
    const order = await this.repository.findByIdTemp(input.idTemp);
    if (!order)
      return {
        success: false,
        error: { code: "REPOSITORY_ERROR", message: "..." },
      };

    let isValid = false;
    let finalValueToUpdate = input.nextValue;
    const updates: Partial<Order> = { updatedAt: new Date() };

    // Clonamos el estado actual para no mutar la orden original antes de tiempo
    let currentStatusForValidation = order.status;

    switch (input.thread) {
      case "STATUS":
        const nextStatus = input.nextValue as OrderStatus;

        console.log(order.status, nextStatus);

        // REPLICA DE TU LÓGICA ANTERIOR:
        if (
          order.origin === "BUSINESS" &&
          nextStatus === OrderStatus.CONFIRMED
        ) {
          finalValueToUpdate = OrderStatus.PREPARING;
          // Aquí está el truco: para la validación, simulamos que el estado actual ya es CONFIRMED
          currentStatusForValidation = OrderStatus.CONFIRMED;
        }

        isValid = OrderStateMachine.canChangeStatus(
          currentStatusForValidation,
          finalValueToUpdate as OrderStatus,
        );
        updates.status = finalValueToUpdate as OrderStatus;
        break;

      case "PAYMENT":
        isValid = OrderStateMachine.canChangePayment(
          order.paymentStatus,
          input.nextValue as PaymentStatus,
        );
        updates.paymentStatus = input.nextValue as PaymentStatus;
        break;

      case "DELIVERY":
        isValid = OrderStateMachine.canChangeDelivery(
          input.nextValue as DeliveryStatus,
          order,
        );
        updates.deliveryStatus = input.nextValue as DeliveryStatus;
        break;
    }

    if (!isValid) {
      return {
        success: false,
        error: { code: "LOGISTICS_ERROR", message: "Transición no permitida" },
      };
    }

    // Persistencia local
    updates.syncStatus =
      order.syncStatus === "LOCAL_ONLY" ? "LOCAL_ONLY" : "SYNC_PENDING"; // Si ya estaba pendiente de creación, sigue igual. Si ya estaba sincronizada, ahora necesita re-sincronizar.
    await this.repository.updateStatuses(order.idTemp, updates);

    return { success: true, data: { ...order, ...updates } };
  }

  async notifySyncError(idTemp: string): Promise<void> {
    const order = await this.repository.findByIdTemp(idTemp);
    if (!order) return;

    // El negocio decide qué pasa ante un error
    const updates: Partial<Order> = {
      syncStatus: "SYNC_ERROR",
      updatedAt: new Date(),
    };

    await this.repository.updateStatuses(idTemp, updates);

    // Emitimos una Signal si queremos que alguien más (como la UI) se entere
    // this.signals.emit('SYNC_FAILED', { idTemp });
  }

  async confirmCloudSync(idTemp: string, cloudId: string): Promise<void> {
    const updates: Partial<Order> = {
      id: cloudId, // El ID real de Postgres
      syncStatus: "SYNCED",
      updatedAt: new Date(),
    };

    await this.repository.updateStatuses(idTemp, updates);
  }
}
