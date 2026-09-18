// src/orchestrator/order.orchestrator.ts
import { v4 as uuid } from "uuid";
import {
  CreateOrderInput,
  OrderServicePublic,
  PaymentMethodTypeFinancial,
  UpdateOrderStatusInput,
} from "../core/orders-core/public";
import { BusinessLocalRepository } from "../infrastructure/dexie/repositories/dexie-business.repository";
import { DexieOrderIdentityAdapter } from "../infrastructure/dexie/repositories/dexie-order-identity.adapter";
import { DexieOrderRepositoryAdapter } from "../infrastructure/dexie/repositories/dexie-order.repository";
import { cloudSyncService } from "../infrastructure/network/CloudSyncService";
import { requestDeliveryDispatch } from "../infrastructure/network/delivery-api";
import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";
import { OrderStatus } from "../core/orders-core/domain/order-state-machine";
import { financialMovementOrchestrator } from "./financial-movement-orchestrator";
import { cashRegisterTurnOrchestrator } from "./cash-register.orchestrator";
import { CashRegisterOrchestrator } from "./cash-register/cash-register-orchestrator";
import { ChangeOrderPaymentMethodInput } from "../core/orders-core/input/change-order-payment-method.input";
import { UpdateOrderInput } from "../core/orders-core/input/update-order.input";
import { ChangeConfirmedPaymentMethodInput } from "../core/orders-core/input/change-confirmed-payment-method.input";

export const createOrderOrchestrator = async (
  input: CreateOrderInput,
  shouldCharge: boolean,
) => {
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter,
    cashRegister: repositoryAdapter,
  });

  if (
    input.deliveryType === "DELIVERY" &&
    input.deliveryProvider === "INTERNAL" &&
    input.customerAddress &&
    input.totalDeliveryCost === 0
  ) {
    input = {
      ...input,
      deliveryQuotationStatus: "PENDING",
    };
  }

  // ============================================================
  // 1. CREAR ORDEN
  // ============================================================

  const result = await orderCore.createOrder(input);

  if (!result.success || !result.data) {
    return result.data;
  }

  const order = result.data;

  if (!shouldCharge) {
    return order;
  }

  await updateOrderStatusOrchestrator({
    idTemp: order.idTemp,
    thread: "PAYMENT",
    nextValue: PaymentStatus.CONFIRMED,
  });
};

export const assignCourierNameOrchestrator = async (
  idTemp: string,
  courierName: string,
) => {
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter,
    cashRegister: repositoryAdapter,
  });

  await orderCore.assignCourierName(idTemp, courierName);
};

export const updateOrderStatusOrchestrator = async (
  input: UpdateOrderStatusInput,
) => {
  const repository = new DexieOrderRepositoryAdapter();
  const identity = new DexieOrderIdentityAdapter();
  const orderCore = OrderServicePublic({
    repository,
    identity,
    cashRegister: repository,
  });

  // 1. Obtenemos el estado previo para evaluar producción en cancelaciones
  const previousOrder = await repository.findByIdTemp(input.idTemp);

  // 2. El Core valida la máquina de estados y guarda localmente
  const result = await orderCore.updateStatus(input);
  if (!result.success || !result.data) return result;

  const order = result.data;

  // Cálculo del costo total de insumos (COGS / Merma)
  const totalCogs = order.items.reduce(
    (acc, item) => acc + (item.costAtPurchase || 0) * item.quantity,
    0,
  );

  try {
    const turn = await cashRegisterTurnOrchestrator.findById(
      result.data.cashRegisterTurnIdTemp || "",
      result.data.businessId,
    );

    const treasuryAccountIdTemp = await resolveTreasuryAccountId(
      turn.cashRegisterId,
      turn.businessId,
      order.orderPaymentMethod,
    );

    if (input.thread === "PAYMENT") {
      const paymentValue = input.nextValue as PaymentStatus;

      if (paymentValue === PaymentStatus.CONFIRMED) {
        // A) Registrar la entrada de dinero a Caja
        await financialMovementOrchestrator.processSaleMovement({
          businessId: order.businessId,
          userId: order.userId || "system",
          treasuryAccountId: treasuryAccountIdTemp,
          amount: order.total,
          paymentMethod: order.orderPaymentMethod,
          orderId: order.idTemp,
          idTemp: turn.idTemp,

          description: `Cobro de pedido #${order.shortCode || order.idTemp.slice(-4)}`,
        });

        // B) Reconocer el COGS al concretarse la Venta
        if (totalCogs > 0) {
          await financialMovementOrchestrator.processCogsMovement({
            businessId: order.businessId,
            userId: order.userId || "system",
            approvedByUserId: order.userId || "system",
            amount: totalCogs,
            orderId: order.idTemp,
            idTemp: turn.idTemp,
            description: `Costo de mercadería (COGS) pedido #${order.shortCode || order.idTemp.slice(-4)}`,
          });
        }
      } else if (paymentValue === PaymentStatus.PENDING) {
        // Reversión del pago en Caja
        await financialMovementOrchestrator.processRefundMovement({
          businessId: order.businessId,
          userId: order.userId || "system",
          amount: order.total,
          paymentMethod: order.orderPaymentMethod,
          orderId: order.idTemp,
          idTemp: turn.idTemp,
          treasuryAccountId: treasuryAccountIdTemp,
          description: `Reversión de cobro pedido #${order.shortCode || order.idTemp.slice(-4)}`,
        });
      }
    }

    // ---------------------------------------------------------------
    // 2. ESCENARIO HILO DE ESTADO (STATUS)
    // ---------------------------------------------------------------
    if (input.thread === "STATUS") {
      const statusValue = input.nextValue as OrderStatus;

      // Cancelación / Rechazo
      if (
        statusValue === OrderStatus.CANCELLED ||
        statusValue === OrderStatus.REJECTED
      ) {
        // 1. Devolución de dinero si la orden estaba cobrada
        if (order.paymentStatus === PaymentStatus.CONFIRMED) {
          await financialMovementOrchestrator.processRefundMovement({
            businessId: order.businessId,
            referenceCashRegisterTurnId: order.cashRegisterTurnIdTemp,
            userId: order.userId || "system",
            amount: order.total,
            paymentMethod: order.orderPaymentMethod,
            orderId: order.idTemp,
            idTemp: turn.idTemp,
            treasuryAccountId: treasuryAccountIdTemp,
            description: `Devolución por cancelación de pedido #${order.shortCode || order.idTemp.slice(-4)}`,
          });
        }

        // 2. Si se cancela y YA estaba en preparación/lista, los insumos usados van a MERMA
        const wasInProduction =
          previousOrder?.status === OrderStatus.PREPARING ||
          previousOrder?.status === OrderStatus.READY;

        if (wasInProduction && totalCogs > 0) {
          await financialMovementOrchestrator.processMermaMovement({
            businessId: order.businessId,
            userId: order.userId || "system",
            approvedByUserId: order.userId || "system",
            amount: totalCogs,
            orderId: order.idTemp,
            treasuryAccountId: treasuryAccountIdTemp,
            idTemp: turn.idTemp,
            description: `Merma por cancelación de pedido en cocina #${order.shortCode || order.idTemp.slice(-4)}`,
          });
        }
      }
    }
  } catch (cashError) {
    console.error(
      "No se pudo impactar el movimiento financiero al actualizar estado:",
      cashError,
    );
  }

  const esCambioCritico =
    input.thread === "DELIVERY" &&
    (input.nextValue as DeliveryStatus) === DeliveryStatus.REQUESTED;

  // =================================================================
  // SINCRONIZACIÓN Y DESPACHO
  // =================================================================
  if (order.id && (order.origin === "APP" || order.syncPriority === "HIGH")) {
    const updatesPayload: {
      status?: string;
      paymentStatus?: string;
      deliveryStatus?: string;
      updatedAt: string;
    } = {
      updatedAt: order.updatedAt
        ? new Date(order.updatedAt).toISOString()
        : new Date().toISOString(),
    };

    if (input.thread === "STATUS") updatesPayload.status = input.nextValue;
    if (input.thread === "PAYMENT")
      updatesPayload.paymentStatus = input.nextValue;
    if (input.thread === "DELIVERY")
      updatesPayload.deliveryStatus = input.nextValue;

    cloudSyncService
      .syncOrderUpdatesOffline(order.id, updatesPayload)
      .then(async (success) => {
        if (success && order.id) {
          await orderCore.confirmCloudSync(order.idTemp, order.id);
        } else {
          await orderCore.notifySyncError(order.idTemp);
        }
      })
      .catch(async (error) => {
        console.warn(
          "Fallo de red al actualizar estado. El SyncWorker resolverá en el fondo.",
          error,
        );
        await orderCore.notifySyncError(order.idTemp);
      });
  } else if (!order.id && esCambioCritico) {
    // syncQueueWorker.processQueue().catch(...);
  }

  if (
    input.thread === "DELIVERY" &&
    (input.nextValue as DeliveryStatus) === DeliveryStatus.REQUESTED &&
    order.customerAddress
  ) {
    const businessDiex = new BusinessLocalRepository();
    const business = await businessDiex.getCurrentBusiness();
    await requestDeliveryDispatch({
      businessId: order.businessId,
      orderId: order.idTemp,
      quotedCost: order.totalDeliveryCost,
      customerAddress: order.customerAddress,
      originName: business?.name || "",
      originAddress: business?.address || "",
      originLatitude: business?.latitude,
      originLongitude: business?.longitude,
    });
  }

  return result;
};

export const applyOrderDiscountOrchestrator = async (
  orderId: string,
  type: "PERCENTAGE" | "FIXED",
  value: number,
) => {
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter,
    cashRegister: repositoryAdapter,
  });

  return await orderCore.applyDiscount({
    orderId,
    type,
    value,
  });
};

export async function changeOrderPaymentMethodOrchestrator(
  orderId: string,
  paymentMethod: PaymentMethodTypeFinancial,
) {
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter,
    cashRegister: repositoryAdapter,
  });
  const input: ChangeOrderPaymentMethodInput = { orderId, paymentMethod };
  return orderCore.changePaymentMethod(input);
}

export async function updateOrderOrchestrator(input: UpdateOrderInput) {
  const repositoryAdapter = new DexieOrderRepositoryAdapter();
  const identityAdapter = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: repositoryAdapter,
    identity: identityAdapter,
    cashRegister: repositoryAdapter,
  });
  return orderCore.updateOrder(input);
}

export async function changeConfirmedOrderPaymentMethodOrchestrator(
  input: ChangeConfirmedPaymentMethodInput,
) {
  // ============================================================
  // CORES
  // ============================================================

  const orderRepository = new DexieOrderRepositoryAdapter();
  const orderIdentity = new DexieOrderIdentityAdapter();

  const orderCore = OrderServicePublic({
    repository: orderRepository,
    identity: orderIdentity,
    cashRegister: orderRepository,
  });

  const cashRegisterTurnCore = cashRegisterTurnOrchestrator;
  const financialMovementCore = financialMovementOrchestrator;

  const order = await orderRepository.findByIdTemp(input.orderId);

  if (!order) {
    throw new Error("No se encontró la orden.");
  }

  if (!order.cashRegisterTurnIdTemp) {
    throw new Error("La orden no tiene asociado un turno de caja.");
  }

  const turn = await cashRegisterTurnCore.findById(
    order.cashRegisterTurnIdTemp,
    order.businessId,
  );

  let treasuryAccountId = await resolveTreasuryAccountId(
    turn.cashRegisterId,
    turn.businessId,
    input.paymentMethod,
  );

  const orderResult = await orderCore.changeConfirmedPaymentMethod({
    orderId: input.orderId,
    paymentMethod: input.paymentMethod,
    authorizationCode: input.authorizationCode,
  });

  if (!orderResult.success) {
    return orderResult;
  }

  // ============================================================
  // 6. MODIFICAR MOVIMIENTO FINANCIERO
  // ============================================================

  const movement = await financialMovementCore.changeSalePaymentMethod({
    orderId: input.orderId,
    paymentMethod: input.paymentMethod,
    treasuryAccountId,
  });

  // ============================================================
  // 7. RESULTADO
  // ============================================================

  return {
    success: true,
    data: {
      order: orderResult.data,
      movement,
    },
  };
}

export async function resolveTreasuryAccountId(
  cashRegisterId: string,
  businessId: string,
  paymentMethod: PaymentMethodTypeFinancial,
): Promise<string> {
  const cashRegisterPaymentMethodCore = new CashRegisterOrchestrator();

  if (paymentMethod === PaymentMethodTypeFinancial.CASH) {
    const cashRegister = await cashRegisterPaymentMethodCore.findById(
      cashRegisterId,
      businessId,
    );

    return cashRegister.defaultTreasuryAccountId;
  }

  const { paymentMethods } =
    await cashRegisterPaymentMethodCore.findByIdWithPaymentMethods(
      cashRegisterId,
      businessId,
    );

  const configuredPaymentMethod = paymentMethods.find(
    (p) => p.paymentMethod === paymentMethod && p.isActive,
  );

  if (!configuredPaymentMethod) {
    throw new Error("La caja no tiene asociado ese medio de pago activo.");
  }

  return configuredPaymentMethod.treasuryAccountId;
}
