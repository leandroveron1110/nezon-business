// src/infrastructure/network/CloudSyncService.ts

import { apiGet, apiPost } from "@/lib/apiFetch";
import { LocalTreasuryAccount } from "../dexie/shcema/treasury-account.schema";

class CloudSyncService {
  // ============================================================
  // TREASURY ACCOUNT
  // ============================================================

  /**
   * Obtiene todas las cuentas de tesorería de un negocio.
   *
   * Se utiliza para sincronizar datos existentes en el servidor
   * hacia IndexedDB.
   */
  async getTreasuryAccounts(
    businessId: string,
  ): Promise<LocalTreasuryAccount[]> {
    const response = await apiGet<LocalTreasuryAccount[]>(`/treasury-accounts/business/${businessId}`);

    if (response.error || !response.data) {
      throw new Error("No se pudieron obtener las cuentas de tesorería");
    }

    return response.data;
  }

  /**
   * Crea una cuenta de tesorería en el servidor.
   *
   * El backend debe conservar el idTemp recibido y devolver
   * el id definitivo generado por el servidor.
   */
  async createTreasuryAccount(
    account: LocalTreasuryAccount,
  ): Promise<{ id: string; idTemp: string }> {
    const response = await apiPost<LocalTreasuryAccount>("/treasury-accounts", account );

    if (response.error || !response.data) {
      throw new Error("No se pudo crear la cuenta de tesorería");
    }

    return {
        id: response.data?.id || "",
        idTemp: response.data?.idTemp
    };
  }

  /**
   * Actualiza una cuenta de tesorería existente.
   *
   * Utilizamos el id del servidor para identificar
   * el recurso remoto.
   */
  async updateTreasuryAccount(account: LocalTreasuryAccount): Promise<void> {
    if (!account.id) {
      throw new Error("No se puede actualizar una cuenta sin id de servidor");
    }

    const response = await fetch(`/treasury-accounts/${account.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
    });

    if (!response.ok) {
      throw new Error("No se pudo actualizar la cuenta de tesorería");
    }
  }
}

export const cloudSyncService = new CloudSyncService();
