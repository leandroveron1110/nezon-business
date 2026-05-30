export type DeliveryQuotationStatus =
  | "PENDING"
  | "RESOLVED"
  | "ERROR";

export type DeliveryResolutionStrategy =
  | "ZONE_WITH_STREET"
  | "LIVE_MAP"
  | "ZONE_FALLBACK"
  | "MANUAL";

export type DeliveryExecutionStatus =
  | "WAITING_DRIVER"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED";

export interface Delivery {
   orderId: string;

   quotationStatus: DeliveryQuotationStatus;

   resolutionStrategy: DeliveryResolutionStrategy;

   executionStatus: DeliveryExecutionStatus;

   resolvedAddress?: string;

   latitude?: number;
   longitude?: number;

   zoneId?: string;

   quotedCost?: number;

   provider: "PLATFORM" | "INTERNAL";

   createdAt: Date;
   updatedAt: Date;
}