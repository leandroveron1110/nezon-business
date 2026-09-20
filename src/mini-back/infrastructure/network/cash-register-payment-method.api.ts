import { ApiResponse } from "@/types/api";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { LocalCashRegisterPaymentMethod } from "../dexie/shcema/cash-register-payment-method.schema";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/apiFetch";

const BASE_URL = "/cash-register-payment-methods";

// ============================================================
// RESPONSE
// ============================================================

/**
 * Representa exactamente la respuesta que entrega el backend.
 *
 * IMPORTANTE:
 *
 * Esto NO es el modelo de IndexedDB.
 *
 * La API devuelve tanto los IDs definitivos del servidor
 * como los idTemp utilizados para sincronización.
 */
export interface CashRegisterPaymentMethodResponse {
  id: string;
  idTemp: string | null;

  businessId: string;

  cashRegisterId: string;
  cashRegisterIdTemp: string;

  paymentMethod: PaymentMethodTypeFinancial;

  treasuryAccountId: string;
  treasuryAccountIdTemp: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PAYLOADS
// ============================================================

export interface CreateCashRegisterPaymentMethodPayload {
  idTemp: string;

  businessId: string;

  /**
   * ID local de la caja.
   *
   * Corresponde a LocalCashRegister.idTemp.
   */
  cashRegisterIdTemp: string;

  paymentMethod: PaymentMethodTypeFinancial;

  /**
   * ID local de la cuenta de tesorería.
   *
   * Corresponde a LocalTreasuryAccount.idTemp.
   */
  treasuryAccountIdTemp: string;

  /**
   * ID definitivo de la cuenta de tesorería,
   * si ya existe.
   */
  treasuryAccountId?: string | null;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCashRegisterPaymentMethodPayload {
  businessId?: string;

  /**
   * ID local de la caja.
   */
  cashRegisterIdTemp?: string;

  paymentMethod?: PaymentMethodTypeFinancial;

  /**
   * ID definitivo de la cuenta.
   */
  treasuryAccountId?: string | null;

  /**
   * ID local de la cuenta.
   */
  treasuryAccountIdTemp?: string;

  isActive?: boolean;

  updatedAt?: Date;
}

// ============================================================
// GET POR BUSINESS
// ============================================================

export async function getCashRegisterPaymentMethods(
  businessId: string,
): Promise<CashRegisterPaymentMethodResponse[]> {
  const result = await apiGet<CashRegisterPaymentMethodResponse[]>(
    `${BASE_URL}/business/${businessId}`,
  );

  if (!result.data) {
    throw new Error(
      "Error al obtener los métodos de pago de las cajas",
    );
  }

  return result.data;
}

// ============================================================
// GET POR CAJA
// ============================================================

export async function getCashRegisterPaymentMethodsByCashRegister(
  cashRegisterId: string,
): Promise<ApiResponse<CashRegisterPaymentMethodResponse[]>> {
  return apiGet<CashRegisterPaymentMethodResponse[]>(
    `${BASE_URL}/cash-register/${cashRegisterId}`,
  );
}

// ============================================================
// CREATE
// ============================================================

export async function createCashRegisterPaymentMethod(
  data: CreateCashRegisterPaymentMethodPayload,
): Promise<CashRegisterPaymentMethodResponse> {
  const result = await apiPost<CashRegisterPaymentMethodResponse>(
    BASE_URL,
    data,
  );

  if (!result.data) {
    throw new Error(
      "Error al crear el metodo de pago para la caja",
    );
  }

  return result.data;
}

// ============================================================
// UPDATE
// ============================================================

export async function updateCashRegisterPaymentMethod(
  id: string,
  data: UpdateCashRegisterPaymentMethodPayload,
): Promise<CashRegisterPaymentMethodResponse> {
  const result = await apiPut<CashRegisterPaymentMethodResponse>(
    `${BASE_URL}/${id}`,
    data,
  );

  if (!result.data) {
    throw new Error(
      "Error al actualizar el metodo de pago para la caja",
    );
  }

  if (!result.data) {
    throw new Error(
      "El backend no devolvio el metodo de pago actualizado",
    );
  }

  return result.data;
}

// ============================================================
// TOGGLE ACTIVE
// ============================================================

export async function toggleCashRegisterPaymentMethod(
  id: string,
  isActive: boolean,
): Promise<ApiResponse<CashRegisterPaymentMethodResponse>> {
  return apiPatch<CashRegisterPaymentMethodResponse>(
    `${BASE_URL}/${id}/active`,
    {
      isActive,
    },
  );
}

// ============================================================
// DELETE
// ============================================================

export async function deleteCashRegisterPaymentMethod(
  id: string,
): Promise<ApiResponse<CashRegisterPaymentMethodResponse>> {
  return apiDelete<CashRegisterPaymentMethodResponse>(
    `${BASE_URL}/${id}`,
  );
}