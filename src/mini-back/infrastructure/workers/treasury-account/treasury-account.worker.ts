// src/infrastructure/network/TreasuryAccountSyncWorker.ts

import { connectivityManager } from "../../connectivity/connectivity-manager";
import { checkServerHealth } from "../../connectivity/health-monitor";
import { db } from "../../dexie/db";
import { LocalTreasuryAccount } from "../../dexie/shcema/treasury-account.schema";
import { cloudSyncService } from "../../network/treasury-account-api";

export type TreasuryAccountSyncResult = {
  success: boolean;
  status:
    | "NO_CHANGES"
    | "SYNCED_FULLY"
    | "PARTIAL_ERROR"
    | "OFFLINE"
    | "SERVER_DOWN";
  pendingCount?: number;
};

class TreasuryAccountSyncWorker {
  private isProcessing = false;

  constructor() {
    this.initListeners();
  }

  // ============================================================
  // LISTENERS
  // ============================================================

  private initListeners() {
    if (typeof window === "undefined") {
      return;
    }

    // Cuando vuelve internet intentamos sincronizar.
    window.addEventListener("online", () => {
      this.processQueue();
    });

    // Sincronización periódica.
    setInterval(() => {
      this.processQueue();
    }, 30000);
  }

  // ============================================================
  // PROCESAMIENTO PRINCIPAL
  // ============================================================

  async processQueue(businessId?: string): Promise<TreasuryAccountSyncResult> {
    // ------------------------------------------------------------
    // EVITAR COLISIONES
    // ------------------------------------------------------------

    if (this.isProcessing) {
      return {
        success: false,
        status: "PARTIAL_ERROR",
      };
    }

    // ------------------------------------------------------------
    // VERIFICAR CONECTIVIDAD
    // ------------------------------------------------------------

    if (connectivityManager.isOffline()) {
      return {
        success: false,
        status: "OFFLINE",
      };
    }

    try {
      // ----------------------------------------------------------
      // BUSCAR CAMBIOS LOCALES
      // ----------------------------------------------------------

      const pendingAccounts = await this.getPendingAccounts(businessId);

      // ----------------------------------------------------------
      // SI NO HAY CAMBIOS LOCALES, IGUAL PODEMOS HACER PULL
      // ----------------------------------------------------------

      const isServerAlive = await checkServerHealth();

      if (!isServerAlive) {
        return {
          success: false,
          status: "SERVER_DOWN",
        };
      }

      this.isProcessing = true;

      // ==========================================================
      // 1. PUSH
      // ==========================================================

      await this.pushPendingAccounts(pendingAccounts);

      // ==========================================================
      // 2. PULL
      // ==========================================================

      if (businessId) {
        await this.pullAccounts(businessId);
      }

      // ==========================================================
      // 3. VERIFICACIÓN FINAL
      // ==========================================================

      const remaining = await this.getPendingCount(businessId);

      if (remaining === 0) {
        return {
          success: true,
          status: pendingAccounts.length === 0 ? "NO_CHANGES" : "SYNCED_FULLY",
        };
      }

      return {
        success: false,
        status: "PARTIAL_ERROR",
        pendingCount: remaining,
      };
    } catch (error) {
      console.error(
        "TreasuryAccountSyncWorker: Error durante sincronización.",
        error,
      );

      return {
        success: false,
        status: "PARTIAL_ERROR",
      };
    } finally {
      this.isProcessing = false;
    }
  }

  // ============================================================
  // OBTENER PENDIENTES
  // ============================================================

  private async getPendingAccounts(
    businessId?: string,
  ): Promise<LocalTreasuryAccount[]> {
    const accounts = await db.treasuryAccount
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();

    if (!businessId) {
      return accounts;
    }

    return accounts.filter((account) => account.businessId === businessId);
  }

  // ============================================================
  // PUSH
  // ============================================================

  private async pushPendingAccounts(
    accounts: LocalTreasuryAccount[],
  ): Promise<void> {
    for (const account of accounts) {
      try {
        // ========================================================
        // CREACIÓN
        // ========================================================

        if (!account.id) {
          const result = await cloudSyncService.createTreasuryAccount(account);

          /**
           * IMPORTANTE:
           *
           * Nunca reemplazamos idTemp.
           *
           * Guardamos únicamente el id definitivo
           * que generó el servidor.
           */
          await db.treasuryAccount.update(account.idTemp, {
            id: result.id,
            syncStatus: "SYNCED",
          });

          continue;
        }

        // ========================================================
        // ACTUALIZACIÓN
        // ========================================================

        await cloudSyncService.updateTreasuryAccount(account);

        await db.treasuryAccount.update(account.idTemp, {
          syncStatus: "SYNCED",
        });
      } catch (error) {
        console.error(
          `TreasuryAccountSyncWorker: Error sincronizando ${account.idTemp}`,
          error,
        );

        await db.treasuryAccount.update(account.idTemp, {
          syncStatus: "SYNC_ERROR",
        });
      }
    }
  }

  // ============================================================
  // PULL
  // ============================================================

  private async pullAccounts(businessId: string): Promise<void> {
    const serverAccounts =
      await cloudSyncService.getTreasuryAccounts(businessId);

    for (const serverAccount of serverAccounts) {
      // ========================================================
      // BUSCAR POR IDTEMP
      // ========================================================

      const localAccount = await db.treasuryAccount.get(serverAccount.idTemp);

      // ========================================================
      // NO EXISTE LOCALMENTE
      // ========================================================

      if (!localAccount) {
        await db.treasuryAccount.put({
          ...serverAccount,

          syncStatus: "SYNCED",

          syncPriority: "HIGH",
        });

        continue;
      }

      // ========================================================
      // TIENE CAMBIOS LOCALES
      // ========================================================

      if (
        localAccount.syncStatus === "LOCAL_ONLY" ||
        localAccount.syncStatus === "SYNC_PENDING" ||
        localAccount.syncStatus === "SYNC_ERROR"
      ) {
        /**
         * NO PISAMOS EL DATO LOCAL.
         *
         * El PUSH es responsable de resolver primero
         * ese cambio.
         */
        continue;
      }

      // ========================================================
      // ESTÁ SINCRONIZADO
      // ========================================================

      await db.treasuryAccount.put({
        ...serverAccount,

        syncStatus: "SYNCED",

        syncPriority: "HIGH",
      });
    }
  }

  // ============================================================
  // CONTAR PENDIENTES
  // ============================================================

  private async getPendingCount(businessId?: string): Promise<number> {
    const accounts = await db.treasuryAccount
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();

    if (!businessId) {
      return accounts.length;
    }

    return accounts.filter((account) => account.businessId === businessId)
      .length;
  }
}

// ================================================================
// SINGLETON
// ================================================================

let treasuryAccountSyncWorker: TreasuryAccountSyncWorker | null = null;

export function getTreasuryAccountSyncWorker() {
  if (!treasuryAccountSyncWorker) {
    treasuryAccountSyncWorker = new TreasuryAccountSyncWorker();
  }

  return treasuryAccountSyncWorker;
}
