import { apiGet, apiPatch, apiPost, ApiResult } from "@/lib/apiFetch";
import { IOrder, SyncResponse } from "../types/order";
import { ICompany } from "../types/company";
import { handleApiError } from "@/lib/handleApiError";
import { DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order-state-machine";

export const fetchOrdersByBusinessId = async (
  businessId: string
): Promise<ApiResult<IOrder[]>> => {
  try {
    const res = await apiGet<IOrder[]>(`/orders/business/${businessId}`);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al obtener las ordenes del negocio");
  }
};

export const fetchOrderById = async (
  orderId: string
): Promise<ApiResult<IOrder>> => {
  try {
    const res = await apiGet<IOrder>(`/orders/${orderId}`);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al obtener las ordenes del negocio");
  }
};

export const syncOrdersByBusinessId = async (
  businessId: string,
  lastSyncTime?: string,
  daysBack?: number | null,
  specificDate?: string | null
) => {
  try {
    const res = await apiPost<SyncResponse>(`/orders/sync/business`, {
      id: businessId,
      lastSyncTime,
      daysBack,    // <--- Agregado
      specificDate // <--- Agregado
    });

    if (!res.success || !res.data) {
      throw handleApiError(
        res.error,
        "Error al obtener las  sync ordenes del negocio."
      );
    }
    return {
      orders: res.data.orders,
      latestTimestamp: res.timestamp,
    };
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Error al obtener las  sync ordenes del negocio."
    );
  }
};


/**
 * Representa los campos que pueden cambiar en cualquiera de los 3 hilos.
 * Usamos Partial para que solo envíes lo que realmente cambió.
 */
export interface OrderUpdatePayload {
  status?: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
  // Podrías agregar otros como deliveryProvider si fuera necesario
}

export const fetchUpdateOrdersByOrderID = async (
  orderId: string,
  updates: OrderUpdatePayload
): Promise<ApiResult<IOrder>> => {
  try {
    /**
     * IMPORTANTE: Cambiamos la URL a algo más genérico.
     * Si tu backend todavía requiere el "/status/", deberías hablar con tu "yo" 
     * del backend para unificarlo a PATCH `/orders/${orderId}`.
     */
    const res = await apiPatch<IOrder>(`/orders/order/${orderId}`, updates);
    
    return res.data;
  } catch (error) {
    // El error ahora es genérico: "Error al actualizar el pedido"
    throw handleApiError(error, "No se pudo sincronizar el cambio con el servidor");
  }
};

export const fetchUpdateOrdersPaymentByOrderID = async (
  orderId: string,
  status: string
): Promise<ApiResult<IOrder>> => {
  try {
    const res = await apiPatch<IOrder>(
      `/orders/order/payment-status/status/${orderId}`,
      { status }
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al actualizar el payment-status");
  }
};

export const fetchDeliveryCompany = async (): Promise<
  ApiResult<ICompany[]>
> => {
  try {
    const res = await apiGet<ICompany[]>(`/delivery/companies`);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error cargando delivery companies");
  }
};

export async function fetchAssignCompany(orderId: string, companyId: string) {
  try {
    const res = await apiPost(
      `/delivery/orders/${orderId}/assign-company/${companyId}`
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al asignar una compania delivery");
  }
}
