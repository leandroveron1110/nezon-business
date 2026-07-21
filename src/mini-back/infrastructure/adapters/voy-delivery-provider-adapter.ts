// infrastructure/adapters/VoyDeliveryProviderAdapter.ts

import { fetchCalculateDeliveryCost } from "@/features/order/api/catalog-api";
import { DeliveryProviderPort } from "@/mini-back/core/delivery-core/ports/delivery-provider.port";

export class VoyDeliveryProviderAdapter implements DeliveryProviderPort {
  async quote(input: {
    businessId: string;
    latitude: number;
    longitude: number;
  }): Promise<number> {
    const cost = await fetchCalculateDeliveryCost({
      businessId: input.businessId,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    if (!cost) {
      throw new Error("DELIVERY_PROVIDER_ERROR");
    }


    return cost.price;
  }
}
