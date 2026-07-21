export interface GeocodingPort {
   resolveAddress(
      address: string
   ): Promise<{
      latitude: number;
      longitude: number;
      normalizedAddress: string;
   } | null>;
}