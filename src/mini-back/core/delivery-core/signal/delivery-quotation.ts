export interface DeliveryQuotation {
  quotationStatus:
    | "RESOLVED"
    | "PENDING"
    | "ERROR"
    | "MANUAL";

  resolutionStrategy:
    | "LIVE_MAP"
    | "ZONE_ONLY"
    | "ZONE_WITH_STREET"
    | "ZONE_FALLBACK"
    | "MANUAL";

  quotedCost: number | null;

  requiresManualPrice: boolean;

  latitude?: number;
  longitude?: number;

  zoneId?: string | null;

  resolvedAddress: string;
}