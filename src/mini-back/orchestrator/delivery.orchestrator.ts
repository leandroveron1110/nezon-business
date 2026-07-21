// src/features/order/orchestrators/quote-delivery.orchestrator.ts

import { DeliveryServicePublic } from "@/mini-back/core/delivery-core/public";
import { LOCATION_DATA } from "@/data/location-search-data";
import { ArcgisGeocodingAdapter } from "../infrastructure/adapters/arcgis-geocoding-adapter";
import { VoyDeliveryProviderAdapter } from "../infrastructure/adapters/voy-delivery-provider-adapter";

const deliveryService = DeliveryServicePublic({
  geocodingPort: new ArcgisGeocodingAdapter(),
  deliveryProviderPort: new VoyDeliveryProviderAdapter(),
});

export async function quoteDeliveryOrchestrator(
  rawAddress: string,
  businessId: string,
  provider: "PLATFORM" | "INTERNAL"

) {
  return await deliveryService.quoteDelivery({
    rawAddress,
    businessId,
    provider,
    locations: LOCATION_DATA,
  });
}