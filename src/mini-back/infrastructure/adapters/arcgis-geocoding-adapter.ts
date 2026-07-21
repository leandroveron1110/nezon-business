// infrastructure/adapters/ArcgisGeocodingAdapter.ts

import { EsriProvider } from "leaflet-geosearch";

import { GeocodingPort } from "@/mini-back/core/delivery-core/ports/geocoding.port";


// src/features/order/infrastructure/utils/address-parser.ts

export interface ParsedInput {
  type: 'COORDINATES' | 'GOOGLE_MAPS_LINK' | 'PLUS_CODE' | 'TEXT';
  payload: {
    latitude?: number;
    longitude?: number;
    text?: string;
  };
}

export function parseRawAddress(input: string): ParsedInput {
  const clean = input.trim();

  // 1. COORDENADAS GPS (Ej: "-32.4812, -58.2611" o "-32.4812 -58.2611")
  const gpsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*,\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  const gpsRegexNoComma = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  
  if (gpsRegex.test(clean) || gpsRegexNoComma.test(clean)) {
    const parts = clean.split(/[\s,]+/);
    return {
      type: 'COORDINATES',
      payload: { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) }
    };
  }

  // 2. LINKS DE GOOGLE MAPS (Ej: goo.gl/maps/... o maps.google.com/...)
  if (clean.includes('goo.gl/maps') || clean.includes('maps.google.com') || clean.includes('google.com/maps')) {
    // Si viene con coordenadas incrustadas en la URL larga (ej: @-32.4812,-58.2611)
    const geoUrlRegex = /@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/;
    const match = clean.match(geoUrlRegex);
    if (match) {
      return {
        type: 'GOOGLE_MAPS_LINK',
        payload: { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) }
      };
    }
    return { type: 'GOOGLE_MAPS_LINK', payload: { text: clean } };
  }

  // 3. PLUS CODES (Ej: "CRX2+GH Concepción del Uruguay")
  const plusCodeRegex = /^([23456789CFFGHKLMNPQRTVWXY]{4}\+[23456789CFFGHKLMNPQRTVWXY]{2,})(\s+.+)?$/i;
  if (plusCodeRegex.test(clean)) {
    return { type: 'PLUS_CODE', payload: { text: clean } };
  }

  // 4. TEXTO ESTÁNDAR
  return { type: 'TEXT', payload: { text: clean } };
}


export class ArcgisGeocodingAdapter implements GeocodingPort {
  private provider = new EsriProvider();
  private city = "Concepción del Uruguay";

  async resolveAddress(address: string) {
    try {
      if (!address || address.length < 3) return null;

      const parsed = parseRawAddress(address);

      // CASO A: Ya obtuvimos Coordenadas Directas (por GPS o Link Largo de Maps)
      if (parsed.type === 'COORDINATES' || (parsed.type === 'GOOGLE_MAPS_LINK' && parsed.payload.latitude)) {
        const { latitude, longitude } = parsed.payload;

        // Intentamos Geocodificación Inversa para darle un nombre lindo a la calle
        try {
          const reverseResults = await this.provider.search({
            query: `${longitude}, ${latitude}` // EsriProvider suele requerir [lon, lat] o string legible
          });
          
          return {
            latitude: latitude!,
            longitude: longitude!,
            normalizedAddress: reverseResults[0]?.label || `Coordenadas: ${latitude}, ${longitude}`,
          };
        } catch {
          // Si falla el reverso, no morimos: devolvemos las coordenadas duras
          return {
            latitude: latitude!,
            longitude: longitude!,
            normalizedAddress: `Ubicación por GPS (${latitude}, ${longitude})`,
          };
        }
      }

      // CASO B: Es un Link Corto de Google Maps (goo.gl/maps/...) sin coordenadas visibles
      if (parsed.type === 'GOOGLE_MAPS_LINK' && !parsed.payload.latitude) {
        try {
          // El frontend o backend debe resolver la URL corta mediante un fetch (siguiendo redirects)
          const res = await fetch(parsed.payload.text!, { method: 'HEAD' });
          const longUrl = res.url; // URL final redirigida
          const geoMatch = longUrl.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
          
          if (geoMatch) {
            const lat = parseFloat(geoMatch[1]);
            const lon = parseFloat(geoMatch[2]);
            return {
              latitude: lat,
              longitude: lon,
              normalizedAddress: `Destino desde Google Maps`,
            };
          }
        } catch (err) {
          console.error("Error expandiendo link de Maps:", err);
        }
        return null; // Si no se pudo expandir, no podemos cotizar
      }

      // CASO C: Plus Codes
      if (parsed.type === 'PLUS_CODE') {
        // ArcGIS no se lleva de nativo con Plus Codes. Lo ideal para no meter otra API 
        // es sumarle la ciudad al query para que el proveedor intente resolverlo por texto.
        const fullQuery = `${parsed.payload.text}, ${this.city}, Entre Ríos, Argentina`;
        const results = await this.provider.search({ query: fullQuery });
        
        if (!results.length) return null;
        return {
          latitude: results[0].y,
          longitude: results[0].x,
          normalizedAddress: results[0].label,
        };
      }

      // CASO D: Texto Normal (Tu lógica original intacta)
      const fullQuery = `${address}, ${this.city}, Entre Ríos, Argentina`;
      const results = await this.provider.search({ query: fullQuery });

      if (!results.length) return null;

      const best = results[0];
      const addrType = best.raw?.feature?.attributes?.Addr_Type || "";
      if (addrType === "Locality" || addrType === "City") return null;

      return {
        latitude: best.y,
        longitude: best.x,
        normalizedAddress: best.label || address,
      };

    } catch (error) {
      console.error("Error en ArcgisGeocodingAdapter:", error);
      return null;
    }
  }
}
