// infrastructure/adapters/ArcgisGeocodingAdapter.ts

import { EsriProvider } from "leaflet-geosearch";

import { GeocodingPort } from "@/mini-back/core/DeliveryCore/ports/geocoding.port";

export class ArcgisGeocodingAdapter implements GeocodingPort {
  private provider = new EsriProvider();

  async resolveAddress(address: string) {
    try {
      if (!address || address.length < 3) {
        return null;
      }

      const city = "Concepción del Uruguay";

      const fullQuery = `${address}, ${city}, Entre Ríos, Argentina`;

      const results = await this.provider.search({
        query: fullQuery,
      });

      if (!results.length) {
        return null;
      }

      const best = results[0];

      // =========================================================================
      // VALIDACIÓN DE FALSO POSITIVO
      // =========================================================================

      const addrType = best.raw?.feature?.attributes?.Addr_Type || "";

      if (addrType === "Locality" || addrType === "City") {
        return null;
      }

      return {
        latitude: best.y,
        longitude: best.x,

        normalizedAddress: best.label || address,
      };
    } catch (error) {
      console.error(error);

      return null;
    }
  }
}
