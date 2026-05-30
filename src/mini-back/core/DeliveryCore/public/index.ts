// src/mini-back/core/DeliveryCore/public/index.ts
import { DeliveryProviderPort } from "../ports/delivery-provider.port";
import { GeocodingPort } from "../ports/geocoding.port";
import { DeliveryService } from "../service/delivery.service";
import { IDeliveryService } from "./delivery-service.interface";

export interface DeliveryDependencyContainer {
  geocodingPort: GeocodingPort;
  deliveryProviderPort: DeliveryProviderPort
}

export const DeliveryServicePublic = (dependencies: DeliveryDependencyContainer): IDeliveryService => {
    return new DeliveryService(
        dependencies.geocodingPort,
        dependencies.deliveryProviderPort
    )
}

// --- EXPORTACIONES DE DOMINIO ---
export * from "../domain/delivery.entity";
export * from "../domain/delivery.types";

// --- EXPORTACIONES DE INPUTS ---
export * from "../inputs/quote-delivery.input";
export * from "../inputs/resolve-address.input";

// --- EXPORTACIONES DE PORTS ---
export * from "../ports/delivery-provider.port";
export * from "../ports/geocoding.port";