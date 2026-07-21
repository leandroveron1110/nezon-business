// src/core/delivery/service/delivery.service.ts

import {
  DeliveryQuotationStatus,
  DeliveryResolutionStrategy,
} from "../domain/delivery.entity";

import { BarrioSuggestion, LocationSuggestion } from "../domain/delivery.types";

import { GeocodingPort } from "../ports/geocoding.port";
import { DeliveryProviderPort } from "../ports/delivery-provider.port";

import { ResolveAddressInput } from "../inputs/resolve-address.input";
import { QuoteDeliveryInput } from "../inputs/quote-delivery.input";

import { DeliveryAddressResolution } from "../signal/delivery-addressResolution.signal";
import { DeliveryQuotation } from "../signal/delivery-quotation";

export interface DeliveryServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export class DeliveryService {
  constructor(
    private readonly geocoding: GeocodingPort,
    private readonly provider: DeliveryProviderPort,
  ) {}

  async resolveAddress(
    input: ResolveAddressInput,
  ): Promise<DeliveryServiceResponse<DeliveryAddressResolution>> {
    try {
      const query = input.rawAddress.trim();

      if (!query) {
        return {
          success: false,
          error: {
            code: "EMPTY_ADDRESS",
            message: "La dirección está vacía.",
          },
        };
      }

      const queryLower = query.toLowerCase();

      const barrios = input.locations.filter(
        (location): location is BarrioSuggestion => location.type === "BARRIO",
      );

      const regexInteriorBarrio =
        /\b(mza|mz|m|casa|csa|c|mod|modulo|sec|seccion|s|block|b|lote|l)\b/i;

      let barrioEncontrado: BarrioSuggestion | null = null;

      let queryParaGeocoding: string | null = null;

      if (query.includes(" - ")) {
        const partes = query.split(" - ");

        const nombreBarrio = partes[0].trim().toLowerCase();

        const restoDireccion = partes[1]?.trim() || "";

        barrioEncontrado =
          barrios.find((b) => b.name.toLowerCase() === nombreBarrio) || null;

        if (regexInteriorBarrio.test(restoDireccion.toLowerCase())) {
          queryParaGeocoding = null;
        } else {
          queryParaGeocoding = restoDireccion;
        }
      }

      else {
        barrioEncontrado =
          barrios
            .sort((a, b) => b.name.length - a.name.length)
            .find((b) => queryLower.startsWith(b.name.toLowerCase())) || null;

        if (barrioEncontrado) {
          const restoDireccion = query
            .substring(barrioEncontrado.name.length)
            .trim();

          if (restoDireccion) {
            if (regexInteriorBarrio.test(restoDireccion.toLowerCase())) {
              queryParaGeocoding = null;
            } else {
              queryParaGeocoding = restoDireccion;
            }
          }
        }
      }

      if (barrioEncontrado && !queryParaGeocoding) {
        return {
          success: true,
          data: {
            strategy: "ZONE_ONLY",

            normalizedAddress: query,

            zoneId: barrioEncontrado.zoneId,

            barrioName: barrioEncontrado.name,

            resolved: false,
          },
        };
      }

      const finalAddress = queryParaGeocoding || query;

      const resolved = await this.geocoding.resolveAddress(finalAddress);

      if (!resolved) {
        return {
          success: false,
          error: {
            code: "ADDRESS_NOT_FOUND",
            message: "No pudimos resolver la dirección.",
          },
        };
      }

      return {
        success: true,
        data: {
          strategy: barrioEncontrado ? "ZONE_WITH_STREET" : "LIVE_MAP",

          normalizedAddress: resolved.normalizedAddress,

          latitude: resolved.latitude,
          longitude: resolved.longitude,

          zoneId: barrioEncontrado?.zoneId || null,

          barrioName: barrioEncontrado?.name || null,

          resolved: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ADDRESS_RESOLUTION_ERROR",
          message: "Falló la resolución de dirección.",
        },
      };
    }
  }

  async quoteDelivery(
    input: QuoteDeliveryInput,
  ): Promise<DeliveryServiceResponse<DeliveryQuotation>> {
    try {
      const resolution = await this.resolveAddress({
        rawAddress: input.rawAddress,
        locations: input.locations,
      });

      console.log("RESOLUTION", resolution);


      if (!resolution.success || !resolution.data) {
        return {
          success: false,
          error: {
            code: "ADDRESS_RESOLUTION_FAILED",
            message: "No pudimos resolver la dirección.",
          },
        };
      }

      const resolved = resolution.data;

      if (resolved.strategy === "ZONE_ONLY") {
        return {
          success: true,
          data: {
            quotationStatus: "PENDING",

            resolutionStrategy: "ZONE_ONLY",

            quotedCost: null,

            requiresManualPrice: true,

            zoneId: resolved.zoneId || null,

            resolvedAddress: resolved.normalizedAddress,
          },
        };
      }
      let quotedCost = 0;

      let quotationStatus: DeliveryQuotationStatus = "PENDING";

      let strategy: DeliveryResolutionStrategy = "LIVE_MAP";

      try {
        quotedCost = await this.provider.quote({
          businessId: input.businessId,
          latitude: resolved.latitude!,
          longitude: resolved.longitude!,
        });

        quotationStatus = "RESOLVED";

        strategy =
          resolved.strategy === "ZONE_WITH_STREET"
            ? "ZONE_WITH_STREET"
            : "LIVE_MAP";
      } catch {
        quotationStatus = "ERROR";

        strategy =
          resolved.strategy === "ZONE_WITH_STREET" ? "ZONE_FALLBACK" : "MANUAL";
      }
      const result = {
        success: true,
        data: {
          quotationStatus,

          resolutionStrategy: strategy,

          quotedCost,

          requiresManualPrice: quotationStatus !== "RESOLVED",

          latitude: resolved.latitude,
          longitude: resolved.longitude,

          zoneId: resolved.zoneId || null,

          resolvedAddress: resolved.normalizedAddress,
        },
      };

      console.log("QUOTATION RESULT", result);

      return result;
    } catch {
      return {
        success: false,
        error: {
          code: "DELIVERY_QUOTATION_ERROR",
          message: "Falló el pipeline de cotización.",
        },
      };
    }
  }
}
