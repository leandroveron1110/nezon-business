// src/infrastructure/network/CashRegisterSyncWorker.ts

import { connectivityManager } from "../../connectivity/connectivity-manager";
import { checkServerHealth } from "../../connectivity/health-monitor";
import { db } from "../../dexie/db";
import {
  cashRegisterApi,
  CashRegisterResponse,
} from "../../network/cash-register-api";

export type CashRegisterSyncResult = {
  success: boolean;
  status:
    | "NO_CHANGES"
    | "SYNCED_FULLY"
    | "PARTIAL_ERROR"
    | "OFFLINE"
    | "SERVER_DOWN";
  pendingCount?: number;
};

class CashRegisterSyncWorker {
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
      void this.processQueue();
    });

    // Sincronización periódica.
    setInterval(() => {
      void this.processQueue();
    }, 30000);
  }

  // ============================================================
  // SYNC MANUAL
  // ============================================================

  async forceSync(businessId?: string): Promise<CashRegisterSyncResult> {
    return this.processQueue(businessId);
  }

  // ============================================================
  // PROCESAMIENTO PRINCIPAL
  // ============================================================

  async processQueue(businessId?: string): Promise<CashRegisterSyncResult> {
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

      const pendingRegisters = await this.getPendingRegisters(businessId);

      // ----------------------------------------------------------
      // VERIFICAR SERVIDOR
      // ----------------------------------------------------------

      const serverAlive = await checkServerHealth();

      if (!serverAlive) {
        return {
          success: false,
          status: "SERVER_DOWN",
        };
      }

      this.isProcessing = true;

      // ==========================================================
      // 1. PUSH
      // ==========================================================

      await this.pushPendingRegisters(pendingRegisters);

      // ==========================================================
      // 2. PULL
      // ==========================================================
      //
      // IMPORTANTE:
      //
      // El PULL se ejecuta aunque no haya cambios locales.
      //
      // Esto permite que un dispositivo nuevo descargue las cajas
      // que ya existen en el servidor.
      //
      // ==========================================================

      if (businessId) {
        await this.pullRegisters(businessId);
      }

      // ==========================================================
      // 3. VERIFICACIÓN FINAL
      // ==========================================================

      const remaining = await this.getPendingCount(businessId);

      if (remaining === 0) {
        return {
          success: true,
          status: pendingRegisters.length === 0 ? "NO_CHANGES" : "SYNCED_FULLY",
        };
      }

      return {
        success: false,
        status: "PARTIAL_ERROR",
        pendingCount: remaining,
      };
    } catch (error) {
      console.error(
        "[CashRegisterSyncWorker] Error durante sincronización:",
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

  private async getPendingRegisters(businessId?: string) {
    const registers = await db.cashRegister
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();

    if (!businessId) {
      return registers;
    }

    return registers.filter((register) => register.businessId === businessId);
  }

  // ============================================================
  // PUSH
  // ============================================================

  private async pushPendingRegisters(
    registers: Awaited<
      ReturnType<CashRegisterSyncWorker["getPendingRegisters"]>
    >,
  ): Promise<void> {
    for (const register of registers) {
      try {
        // ========================================================
        // CREACIÓN
        // ========================================================

        if (!register.id) {
          const remote = await cashRegisterApi.create({
            idTemp: register.idTemp,
            businessId: register.businessId,
            name: register.name,
            defaultTreasuryAccountId: register.defaultTreasuryAccountId,
            isActive: register.isActive,
          });

          await db.cashRegister.update(register.idTemp, {
            id: remote.id,
            syncStatus: "SYNCED",

            createdAt: new Date(remote.createdAt),
            updatedAt: new Date(remote.updatedAt),
          });

          continue;
        }

        // ========================================================
        // ACTUALIZACIÓN
        // ========================================================

        const remote = await cashRegisterApi.update(register.id, {
          name: register.name,
          defaultTreasuryAccountId: register.defaultTreasuryAccountId,
          isActive: register.isActive,
        });

        await db.cashRegister.update(register.idTemp, {
          syncStatus: "SYNCED",
          updatedAt: new Date(remote.updatedAt),
        });
      } catch (error) {
        console.error(
          `[CashRegisterSyncWorker] Error sincronizando ${register.idTemp}`,
          error,
        );

        await db.cashRegister.update(register.idTemp, {
          syncStatus: "SYNC_ERROR",
        });
      }
    }
  }

  // ============================================================
  // PULL
  // ============================================================

  private async pullRegisters(businessId: string): Promise<void> {
    const remoteRegisters = await cashRegisterApi.findByBusinessId(businessId);

    for (const remote of remoteRegisters) {
      // ----------------------------------------------------------
      // EL SERVIDOR DEBE DEVOLVER IDTEMP
      // ----------------------------------------------------------

      if (!remote.idTemp) {
        console.warn(
          `[CashRegisterSyncWorker] Caja ${remote.id} no tiene idTemp`,
        );

        continue;
      }

      // ----------------------------------------------------------
      // BUSCAR LOCALMENTE POR IDTEMP
      // ----------------------------------------------------------

      const local = await db.cashRegister.get(remote.idTemp);

      // ----------------------------------------------------------
      // NO EXISTE LOCALMENTE
      // ----------------------------------------------------------

      if (!local) {
        await db.cashRegister.put({
          idTemp: remote.idTemp,
          id: remote.id,

          businessId: remote.businessId ?? businessId,

          name: remote.name,

          defaultTreasuryAccountId: remote.defaultTreasuryAccountIdTemp,

          isActive: remote.isActive,

          syncStatus: "SYNCED",
          syncPriority: "HIGH",

          createdAt: new Date(remote.createdAt),
          updatedAt: new Date(remote.updatedAt),
        });

        continue;
      }

      // ----------------------------------------------------------
      // TIENE CAMBIOS LOCALES
      // ----------------------------------------------------------

      if (
        local.syncStatus === "LOCAL_ONLY" ||
        local.syncStatus === "SYNC_PENDING" ||
        local.syncStatus === "SYNC_ERROR"
      ) {
        // No pisamos cambios locales pendientes.
        continue;
      }

      // ----------------------------------------------------------
      // ESTÁ SINCRONIZADO
      // ----------------------------------------------------------

      await db.cashRegister.put({
        idTemp: remote.idTemp,
        id: remote.id,

        businessId: remote.businessId ?? businessId,

        name: remote.name,

        defaultTreasuryAccountId:
          remote.defaultTreasuryAccountIdTemp ??
          remote.defaultTreasuryAccountId,

        isActive: remote.isActive,

        syncStatus: "SYNCED",
        syncPriority: "HIGH",

        createdAt: new Date(remote.createdAt),
        updatedAt: new Date(remote.updatedAt),
      });
    }
  }

  // ============================================================
  // CONTAR PENDIENTES
  // ============================================================

  private async getPendingCount(businessId?: string): Promise<number> {
    const registers = await db.cashRegister
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();

    if (!businessId) {
      return registers.length;
    }

    return registers.filter((register) => register.businessId === businessId)
      .length;
  }
}

// ================================================================
// SINGLETON
// ================================================================

let cashRegisterSyncWorker: CashRegisterSyncWorker | null = null;

export function getCashRegisterSyncWorker() {
  if (!cashRegisterSyncWorker) {
    cashRegisterSyncWorker = new CashRegisterSyncWorker();
  }

  return cashRegisterSyncWorker;
}
