import { apiGet, apiPost } from "@/lib/apiFetch";
import { handleApiError } from "@/lib/handleApiError";

export interface RequestDeliveryQuotationInput {
  businessId: string;

  orderId: string;

  customerAddress: string;

  latitude?: number;

  longitude?: number;

  zoneId?: string | null;

  notes?: string;
}

export interface ResolvedDeliveryQuotation {
  id: string;
  orderId: string;

  destinationAddress: string;

  quotedCost: number | null;

  latitude?: number;

  longitude?: number;

  zoneId?: string | null;
}

export async function requestDeliveryQuotation(
  input: RequestDeliveryQuotationInput,
): Promise<boolean> {
  try {
    const res = await apiPost<void>(
      "/delivery-commands",
      {
        businessId: input.businessId,

        orderId: input.orderId,

        command: "QUOTE",

        destinationAddress: input.customerAddress,

        destinationLatitude: input.latitude,

        destinationLongitude: input.longitude,

        zoneId: input.zoneId,

        notes: input.notes,
      },
    );

    return res.success;
  } catch (error) {
    throw handleApiError(
      error,
      "Error al solicitar la cotización del delivery",
    );
  }
}

export async function requestDeliveryDispatch(
  input: RequestDeliveryQuotationInput,
): Promise<boolean> {
  try {
    const res = await apiPost<void>(
      "/delivery-commands",
      {
        businessId: input.businessId,

        orderId: input.orderId,

        command: "DISPATCH",

        destinationAddress: input.customerAddress,

        destinationLatitude: input.latitude,

        destinationLongitude: input.longitude,

        zoneId: input.zoneId,

        notes: input.notes,
      },
    );

    return res.success;
  } catch (error) {
    throw handleApiError(
      error,
      "Error al solicitar la dispatch del delivery",
    );
  }
}

export async function fetchResolvedDeliveryQuotations(
  businessId: string,
): Promise<ResolvedDeliveryQuotation[]> {
  try {
    const res = await apiGet<ResolvedDeliveryQuotation[]>(
      `/delivery-commands/business/${businessId}/quotes`,
    );

    if (!res.success || !res.data) {
      return [];
    }

    return res.data;
  } catch (error) {
    throw handleApiError(
      error,
      "Error obteniendo cotizaciones resueltas",
    );
  }
}