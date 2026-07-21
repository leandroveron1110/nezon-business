import { DeliveryServicePublic } from "@/mini-back/core/delivery-core/public";

import { ArcgisGeocodingAdapter } from "../adapters/arcgis-geocoding-adapter";
import { VoyDeliveryProviderAdapter } from "../adapters/voy-delivery-provider-adapter";

export function createDeliveryService() {
  return DeliveryServicePublic({
    geocodingPort: new ArcgisGeocodingAdapter(),
    deliveryProviderPort: new VoyDeliveryProviderAdapter(),
  });
}
