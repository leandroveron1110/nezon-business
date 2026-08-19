// src/orchestrator/order.orchestrator.ts
import { v4 as uuid } from "uuid";
import {
  CreateOrderInput,
  OrderServicePublic,
  UpdateOrderStatusInput,
} from "../core/orders-core/public";
import { BusinessLocalRepository } from "../infrastructure/dexie/repositories/dexie-business.repository";
import { DexieOrderIdentityAdapter } from "../infrastructure/dexie/repositories/dexie-order-identity.adapter";
import { DexieOrderRepositoryAdapter } from "../infrastructure/dexie/repositories/dexie-order.repository";
import { cloudSyncService } from "../infrastructure/network/CloudSyncService";
import { requestDeliveryDispatch } from "../infrastructure/network/delivery-api";
import { cashRegisterOrchestrator } from "./cash-register.orchestrator";
import { quoteDeliveryOrchestrator } from "./delivery.orchestrator";
import { DeliveryStatus, PaymentStatus } from "@/types/order-state-machine";
import { OrderStatus } from "../core/orders-core/domain/order-state-machine";
// import { syncQueueWorker } from "../infrastructure/network/SyncQueueWorker";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const createOrderOrchestrator = async (input: CreateOrderInput) => {
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

  // 1. Ejecución soberana del negocio en Local (Dexie)
  let result = await orderCore.createOrder(input);

  // if (result.success && result.data) {
  //   const order = result.data;

  //   // 2. Control de Sincronización Inmediata para pedidos HIGH (Síncrono y agresivo)
  //   if (order.syncStatus === "SYNC_PENDING" && order.syncPriority === "HIGH") {
  //     let attempts = 0;
  //     let cloudId: string | null = null;
  //     let success = false;

  //     while (attempts < MAX_RETRIES && !success) {
  //       try {
  //         attempts++;
  //         // Enviamos payload completo asegurando idempotencia mediante idTemp
  //         cloudId = await cloudSyncService.triggerImmediateSync({
  //           ...order,
  //         });
  //         success = true;
  //       } catch (err) {
  //         console.warn(
  //           `Intento ${attempts} falló para orden ${order.shortCode}. Red inestable.`,
  //         );
  //         if (attempts < MAX_RETRIES) await delay(RETRY_DELAY_MS);
  //       }
  //     }

  //     // 3. El Orquestador le comunica el resultado de la infraestructura al Core
  //     if (success && cloudId) {
  //       // El core impacta el ID remoto, corre el mutateState interno y guarda en Dexie
  //       await orderCore.confirmCloudSync(order.idTemp, cloudId);
  //     } else {
  //       console.error(
  //         `Sincronización inmediata fallida tras ${MAX_RETRIES} intentos.`,
  //       );
  //       // El core pasa la orden a SYNC_ERROR e impacta el historial en Dexie
  //       await orderCore.notifySyncError(order.idTemp);
  //     }
  //   }
  // }

  return result;
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

  // =================================================================
  // 🌟 IMPACTO FINANCIERO Y CONTABLE (Coordinación de Cores)
  // =================================================================
  try {
    // ---------------------------------------------------------------
    // 1. ESCENARIO HILO DE PAGO (PAYMENT)
    // ---------------------------------------------------------------
    if (input.thread === "PAYMENT") {
      const paymentValue = input.nextValue as PaymentStatus;

      if (paymentValue === PaymentStatus.CONFIRMED) {
        // A) Registrar la entrada de dinero a Caja
        await cashRegisterOrchestrator.processSaleMovement({
          businessId: order.businessId,
          userId: order.userId || "system",
          amount: order.total - (order.totalDeliveryCost ?? 0),
          paymentMethod: order.orderPaymentMethod,
          orderId: order.idTemp,
          description: `Cobro de pedido #${order.shortCode || order.idTemp.slice(-4)}`,
        });

        // B) Reconocer el COGS al concretarse la Venta
        if (totalCogs > 0) {
          await cashRegisterOrchestrator.processCogsMovement({
            businessId: order.businessId,
            userId: order.userId || "system",
            approvedByUserId: order.userId || "system",
            amount: totalCogs,
            orderId: order.idTemp,
            description: `Costo de mercadería (COGS) pedido #${order.shortCode || order.idTemp.slice(-4)}`,
          });
        }
      } else if (paymentValue === PaymentStatus.PENDING) {
        // Reversión del pago en Caja
        await cashRegisterOrchestrator.processRefundMovement({
          businessId: order.businessId,
          userId: order.userId || "system",
          amount: order.total - (order.totalDeliveryCost ?? 0),
          paymentMethod: order.orderPaymentMethod,
          orderId: order.idTemp,
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
          await cashRegisterOrchestrator.processRefundMovement({
            businessId: order.businessId,
            referenceCashRegisterTurnId: order.cashRegisterTurnIdTemp,
            userId: order.userId || "system",
            amount: order.total - (order.totalDeliveryCost ?? 0),
            paymentMethod: order.orderPaymentMethod,
            orderId: order.idTemp,
            description: `Devolución por cancelación de pedido #${order.shortCode || order.idTemp.slice(-4)}`,
          });
        }

        // 2. Si se cancela y YA estaba en preparación/lista, los insumos usados van a MERMA
        const wasInProduction =
          previousOrder?.status === OrderStatus.PREPARING ||
          previousOrder?.status === OrderStatus.READY;

        if (wasInProduction && totalCogs > 0) {
          await cashRegisterOrchestrator.processMermaMovement({
            businessId: order.businessId,
            userId: order.userId || "system",
            approvedByUserId: order.userId || "system",
            amount: totalCogs,
            orderId: order.idTemp,
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
      customerAddress: order.customerAddress,
      originName: business?.name || "",
      originAddress: business?.address || "",
      originLatitude: business?.latitude,
      originLongitude: business?.longitude,
    });
  }

  return result;
};
