export interface DeliveryAddressResolution {
  strategy:
    | "ZONE_ONLY"
    | "ZONE_WITH_STREET"
    | "LIVE_MAP";

  normalizedAddress: string;

  resolved: boolean;

  latitude?: number;
  longitude?: number;

  zoneId?: string | null;

  barrioName?: string | null;
}