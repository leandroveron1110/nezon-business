//src/mini-back/core/public/index.ts
import { OrderIdentityPort } from "../ports/order-identity.port";
import { OrderRepositoryPort } from "../ports/order-repository.port";
import { IOrderPublicService } from "./order-service.interface";
import { OrderService } from "../service/order.service";

export interface OrderCoreDependencies {
  repository: OrderRepositoryPort;
  identity: OrderIdentityPort;
  // Si mañana agregás un port de notificaciones, lo sumás acá
}

export const OrderServicePublic = (dependencies: OrderCoreDependencies): IOrderPublicService => {
  return new OrderService(dependencies.repository, dependencies.identity);
};

// --- EXPORTACIONES DE DOMINIO ---
export * from "../domain/order.entity";
export * from "../domain/rules/order-state-machine";
export * from "../domain/order.entity";

// --- EXPORTACIONES DE INPUTS ---
export * from "../input/create-order.input";
export * from "../input/update-order-status.input";

// --- EXPORTACIONES DE PORTS ---
export * from "../ports/order-repository.port";
export * from "../ports/order-identity.port";
export * from "./order-service.interface";
