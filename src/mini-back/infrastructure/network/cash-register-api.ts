// src/infrastructure/network/api/cash-register-api.ts

import { apiGet, apiPost, apiPut } from "@/lib/apiFetch";

export interface CreateCashRegisterPayload {
  idTemp: string;
  businessId: string;
  name: string;
  defaultTreasuryAccountId: string;
  isActive: boolean;
}

export interface UpdateCashRegisterPayload {
  name?: string;
  defaultTreasuryAccountId?: string;
  isActive?: boolean;
}

export interface CashRegisterResponse {
  id: string;
  idTemp: string | null;
  businessId: string;
  name: string;
  defaultTreasuryAccountId: string;
  defaultTreasuryAccountIdTemp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


class CashRegisterApi {
  async create(
    payload: CreateCashRegisterPayload,
  ): Promise<CashRegisterResponse> {
    const response = await apiPost<CashRegisterResponse>(
      `/cash-registers`,
      payload,
    );

    if (!response.data) {
      throw new Error(`Error creando CashRegister`);
    }

    return response.data;
  }

  async update(
    id: string,
    payload: UpdateCashRegisterPayload,
  ): Promise<CashRegisterResponse> {
    const response = await apiPut<CashRegisterResponse>(
      `/cash-registers/${id}`,
      payload,
    );

    if (!response.data) {
      throw new Error(`Error actualizando CashRegister`);
    }

    return response.data;
  }

  async findByBusinessId(businessId: string): Promise<CashRegisterResponse[]> {
    const response = await apiGet<CashRegisterResponse[]>(
      `/cash-registers/business/${businessId}`,
    );

    if (!response.data) {
      throw new Error(`Error obteniendo CashRegisters`);
    }

    return response.data;
  }
}

export const cashRegisterApi = new CashRegisterApi();
