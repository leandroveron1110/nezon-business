// src/core/orders/order.service.ts

import { CreateOrderInput } from "../input/create-order.input";
import { ApplyOrderDiscountInput } from "../input/apply-order-discount.input";

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
import { OrderDiscountRule } from "../domain/rules/order-discount";
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

import { CashRegisterPort } from "../ports/cash-register.port";
import { ChangeOrderPaymentMethodInput } from "../input/change-order-payment-method.input";

export class OrderService implements IOrderPublicService {
  constructor(
    private readonly repository: OrderRepositoryPort,
    private readonly identityPort: OrderIdentityPort,
    private readonly cashRegisterPort: CashRegisterPort,
  ) {}

  // ==========================================================================
  // MUTATE STATE
  // ==========================================================================

  async mutateState(
    input: MutateOrderStateInput,
  ): Promise<OrderServiceResponse> {
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

    const updates: Partial<Order> = {
      updatedAt: new Date(),
    };

    let currentStatusForValidation = order.status;

    const exigeSyncInmediata =
      order.origin === "APP" || order.syncPriority === "HIGH";

    switch (input.thread) {
      case "ORDER": {
        const nextStatus = input.nextValue;

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
        isValid = OrderStateMachine.canChangePayment(
          order.paymentStatus,
          input.nextValue,
        );

        updates.paymentStatus = input.nextValue;

        updates.syncedPayment = exigeSyncInmediata ? false : true;

        break;
      }

      case "DELIVERY": {
        isValid = OrderStateMachine.canChangeDelivery(input.nextValue, order);

        updates.deliveryStatus = input.nextValue;

        updates.syncedDelivery = exigeSyncInmediata ? false : true;

        break;
      }

      case "SYNC": {
        isValid = true;

        updates.syncStatus = input.nextValue;

        if (input.nextValue === "SYNCED") {
          updates.syncedStatus = true;
          updates.syncedPayment = true;
          updates.syncedDelivery = true;
        }

        break;
      }
    }

    if (!isValid) {
      return {
        success: false,
        error: {
          code: "LOGISTICS_ERROR",
          message: `Transición de estado no permitida para el hilo ${input.thread}`,
        },
      };
    }

    if (input.thread !== "SYNC") {
      updates.syncStatus = exigeSyncInmediata ? "SYNC_PENDING" : "LOCAL_ONLY";
    }

    const stateEvent: CoreOrderStateEvent = {
      idTemp: order.idTemp,
      orderId: order.id || null,
      stateType: input.thread,
      value: finalValueToUpdate,
      author: input.author,
      createdAt: new Date(),
    };

    await this.repository.updateStatuses(order.idTemp, updates);

    return {
      success: true,
      data: {
        ...order,
        ...updates,
      } as Order,
    };
  }

  async changePaymentMethod(
    input: ChangeOrderPaymentMethodInput,
  ): Promise<OrderServiceResponse> {
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

    if (order.paymentStatus === PaymentStatus.CONFIRMED) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "No se puede cambiar el medio de pago de una orden que ya fue pagada.",
        },
      };
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REJECTED
    ) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "No se puede cambiar el medio de pago de una orden cancelada.",
        },
      };
    }

    if (order.orderPaymentMethod === input.paymentMethod) {
      return { success: true, data: order };
    }

    const updates: Partial<Order> = {
      orderPaymentMethod: input.paymentMethod,
      updatedAt: new Date(),
    };

    await this.repository.update(order.idTemp, updates);
    return { success: true, data: { ...order, ...updates } as Order };
  }

  // ==========================================================================
  // CREATE ORDER
  // ==========================================================================

  async createOrder(input: CreateOrderInput): Promise<OrderServiceResponse> {
    const identityService = new OrderIdentityService(this.identityPort);

    const nextNumber = await identityService.generate(input.origin);

    const activeTurn = await this.cashRegisterPort.findActive(input.businessId);

    const initialStatus = input.instantPrepare
      ? OrderStatus.PREPARING
      : OrderStatus.PENDING;

    const isHighPriority = SyncPolicy.mustSyncImmediately({
      origin: input.origin,
      deliveryProvider: input.deliveryProvider,
      deliveryStatus: input.deliveryStatus,
    });

    let discountAmount = 0;
    let total = input.subtotal;

    if (input.discountType !== null && input.discountType !== undefined) {
      if (input.discountValue === null || input.discountValue === undefined) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Se especificó un tipo de descuento pero no su valor.",
          },
        };
      }

      try {
        const discountResult = OrderDiscountRule.calculate(
          input.subtotal,
          input.discountType,
          input.discountValue,
        );

        discountAmount = discountResult.discountAmount;

        total = discountResult.total;
      } catch (error) {
        console.log("error con los descuentos", error);
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "El descuento no es válido.",
          },
        };
      }
    }

    // ================================================================
    // ORDEN
    // ================================================================

    const order: Order = {
      idTemp: input.idTemp,

      businessId: input.businessId,

      syncStatus: isHighPriority ? "SYNC_PENDING" : "LOCAL_ONLY",

      syncPriority: isHighPriority ? "HIGH" : "LOW",

      customerName: input.customerName?.trim() || nextNumber.shortCode,

      customerPhone: input.customerPhone || "",

      customerAddress: input.customerAddress,

      customerObservations: input.customerObservations,

      // ================================================================
      // TOTALES
      // ================================================================

      subtotal: input.subtotal,

      discountType: input.discountType ?? null,

      discountValue: input.discountValue ?? null,

      discountAmount,

      total,

      // ================================================================
      // DELIVERY
      // ================================================================

      deliveryType: input.deliveryType,

      deliveryProvider: input.deliveryProvider,

      deliveryPriceMode:
        input.deliveryProvider === "INTERNAL" ? "MANUAL" : "AUTOMATIC",

      totalDeliveryCost:
        input.deliveryType === "DELIVERY" ? input.totalDeliveryCost : 0,

      deliveryQuotationStatus: input.deliveryQuotationStatus,

      // ================================================================
      // PAYMENT
      // ================================================================

      orderPaymentMethod: input.orderPaymentMethod,

      paymentStatus: PaymentStatus.PENDING,

      deliveryStatus:
        input.deliveryType === "DELIVERY"
          ? DeliveryStatus.PENDING
          : DeliveryStatus.NOT_APPLICABLE,

      // ================================================================
      // ORDER
      // ================================================================

      status: initialStatus,

      origin: input.origin,

      items: input.items,

      // ================================================================
      // SYNC
      // ================================================================

      syncedStatus: isHighPriority ? false : true,

      syncedPayment: isHighPriority ? false : true,

      syncedDelivery: isHighPriority ? false : true,

      // ================================================================
      // CASH REGISTER
      // ================================================================

      cashRegisterTurnIdTemp: activeTurn?.idTemp,

      cashRegisterTurnId: activeTurn?.id || null,

      // ================================================================
      // SCHEDULE
      // ================================================================

      scheduledAt: input.scheduledAt,

      // ================================================================
      // IDENTIFIERS
      // ================================================================

      shortCode: nextNumber.shortCode,

      dailyNumber: nextNumber.nextNumber,

      // ================================================================
      // AUDIT
      // ================================================================

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    await this.repository.save(order);

    return {
      success: true,
      data: order,
    };
  }

  // ==========================================================================
  // APPLY DISCOUNT
  // ==========================================================================

  async applyDiscount(
    input: ApplyOrderDiscountInput,
  ): Promise<OrderServiceResponse> {
    // ------------------------------------------------------------------------
    // 1. Buscar orden
    // ------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------
    // 2. Calcular descuento
    // ------------------------------------------------------------------------

    let discountResult;

    try {
      discountResult = OrderDiscountRule.calculate(
        order.subtotal,
        input.type,
        input.value,
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "El descuento no es válido.",
        },
      };
    }

    // ------------------------------------------------------------------------
    // 3. Determinar sincronización
    // ------------------------------------------------------------------------

    const exigeSyncInmediata =
      order.origin === "APP" || order.syncPriority === "HIGH";

    // ------------------------------------------------------------------------
    // 4. Construir actualización
    // ------------------------------------------------------------------------

    const updates: Partial<Order> = {
      discountType: input.type,

      discountValue: input.value,

      discountAmount: discountResult.discountAmount,

      total: discountResult.total,

      updatedAt: new Date(),

      syncStatus: exigeSyncInmediata ? "SYNC_PENDING" : "LOCAL_ONLY",
    };

    // ------------------------------------------------------------------------
    // 5. Persistir
    // ------------------------------------------------------------------------

    await this.repository.update(order.idTemp, updates);

    // ------------------------------------------------------------------------
    // 6. Devolver orden actualizada
    // ------------------------------------------------------------------------

    return {
      success: true,
      data: {
        ...order,
        ...updates,
      } as Order,
    };
  }

  // ==========================================================================
  // UPDATE STATUS
  // ==========================================================================

  async updateStatus(
    input: UpdateOrderStatusInput,
  ): Promise<OrderServiceResponse> {
    const baseConfig = {
      orderId: input.idTemp,
      author: "BUSINESS" as const,
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

  // ==========================================================================
  // COURIER
  // ==========================================================================

  async assignCourierName(idTemp: string, courierName: string): Promise<void> {
    const updates: Partial<Order> = {
      courierName,
    };

    await this.repository.update(idTemp, updates);
  }

  // ==========================================================================
  // SYNC ERROR
  // ==========================================================================

  async notifySyncError(idTemp: string): Promise<void> {
    await this.mutateState({
      orderId: idTemp,
      thread: "SYNC",
      nextValue: "SYNC_ERROR",
      author: "SYSTEM",
    });
  }

  // ==========================================================================
  // CONFIRM CLOUD SYNC
  // ==========================================================================

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
