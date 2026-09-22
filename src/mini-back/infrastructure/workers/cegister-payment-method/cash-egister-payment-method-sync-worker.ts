// src/infrastructure/network/CashRegisterPaymentMethodSyncWorker.ts

import { connectivityManager } from "../../connectivity/connectivity-manager";
import { checkServerHealth } from "../../connectivity/health-monitor";
import { db } from "../../dexie/db";
import { createCashRegisterPaymentMethod, getCashRegisterPaymentMethods, updateCashRegisterPaymentMethod } from "../../network/cash-register-payment-method.api";

export type CashRegisterPaymentMethodSyncResult = {
  success: boolean;
  status:
    | "NO_CHANGES"
    | "SYNCED_FULLY"
    | "PARTIAL_ERROR"
    | "OFFLINE"
    | "SERVER_DOWN";
  pendingCount?: number;
};

class CashRegisterPaymentMethodSyncWorker {
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

    // Cuando vuelve internet.
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

  async forceSync(
    businessId?: string,
  ): Promise<CashRegisterPaymentMethodSyncResult> {
    return this.processQueue(businessId);
  }

  // ============================================================
  // PROCESAMIENTO PRINCIPAL
  // ============================================================

  async processQueue(
    businessId?: string,
  ): Promise<CashRegisterPaymentMethodSyncResult> {
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
    // CONECTIVIDAD
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

      const pendingPaymentMethods =
        await this.getPendingPaymentMethods(businessId);

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

      await this.pushPendingPaymentMethods(pendingPaymentMethods);

      // ==========================================================
      // 2. PULL
      // ==========================================================
      //
      // Aunque no existan cambios locales, descargamos los medios
      // de pago existentes en el servidor.
      //
      // Esto es necesario cuando el usuario entra desde otro
      // dispositivo.
      //
      // ==========================================================

      if (businessId) {
        await this.pullPaymentMethods(businessId);
      }

      // ==========================================================
      // 3. VERIFICACIÓN FINAL
      // ==========================================================

      const remaining = await this.getPendingCount(businessId);

      if (remaining === 0) {
        return {
          success: true,
          status:
            pendingPaymentMethods.length === 0 ? "NO_CHANGES" : "SYNCED_FULLY",
        };
      }

      return {
        success: false,
        status: "PARTIAL_ERROR",
        pendingCount: remaining,
      };
    } catch (error) {
      console.error(
        "[CashRegisterPaymentMethodSyncWorker] Error durante sincronización:",
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

  private async getPendingPaymentMethods(businessId?: string) {
    const paymentMethods = await db.cashRegisterPaymentMethod
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();

    if (!businessId) {
      return paymentMethods;
    }

    return paymentMethods.filter(
      (paymentMethod) => paymentMethod.businessId === businessId,
    );
  }

  // ============================================================
  // PUSH
  // ============================================================

  private async pushPendingPaymentMethods(
    paymentMethods: Awaited<
      ReturnType<
        CashRegisterPaymentMethodSyncWorker["getPendingPaymentMethods"]
      >
    >,
  ): Promise<void> {
    for (const paymentMethod of paymentMethods) {
      try {
        // ========================================================
        // CREACIÓN
        // ========================================================

        if (!paymentMethod.id) {
          const remote = await createCashRegisterPaymentMethod({
            idTemp: paymentMethod.idTemp,

            businessId: paymentMethod.businessId,

            cashRegisterIdTemp: paymentMethod.cashRegisterId,

            createdAt: paymentMethod.createdAt,
            updatedAt: paymentMethod.updatedAt,

            paymentMethod: paymentMethod.paymentMethod,

            treasuryAccountIdTemp: paymentMethod.treasuryAccountIdTemp,

            isActive: paymentMethod.isActive,
          });

          await db.cashRegisterPaymentMethod.update(paymentMethod.idTemp, {
            id: remote.id,

            cashRegisterId: remote.cashRegisterIdTemp,

            treasuryAccountId: remote.treasuryAccountId ?? null,

            syncStatus: "SYNCED",

            createdAt: new Date(remote.createdAt),
            updatedAt: new Date(remote.updatedAt),
          });

          continue;
        }

        // ========================================================
        // ACTUALIZACIÓN
        // ========================================================

        const remote = await updateCashRegisterPaymentMethod(
          paymentMethod.id,
          {
            paymentMethod: paymentMethod.paymentMethod,

            treasuryAccountIdTemp: paymentMethod.treasuryAccountIdTemp,

            isActive: paymentMethod.isActive,
          },
        );

        await db.cashRegisterPaymentMethod.update(paymentMethod.idTemp, {
          syncStatus: "SYNCED",
        });
      } catch (error) {
        console.error(
          `[CashRegisterPaymentMethodSyncWorker] Error sincronizando ${paymentMethod.idTemp}`,
          error,
        );

        await db.cashRegisterPaymentMethod.update(paymentMethod.idTemp, {
          syncStatus: "SYNC_ERROR",
        });
      }
    }
  }

  // ============================================================
  // PULL
  // ============================================================

  private async pullPaymentMethods(businessId: string): Promise<void> {
    const remotePaymentMethods =
      await getCashRegisterPaymentMethods(businessId);

    for (const remote of remotePaymentMethods) {
      // ----------------------------------------------------------
      // EL SERVIDOR DEBE DEVOLVER IDTEMP
      // ----------------------------------------------------------

      if (!remote.idTemp) {
        console.warn(
          `[CashRegisterPaymentMethodSyncWorker] Medio de pago ${remote.id} no tiene idTemp`,
        );

        continue;
      }

      // ----------------------------------------------------------
      // BUSCAR LOCALMENTE POR IDTEMP
      // ----------------------------------------------------------

      const local = await db.cashRegisterPaymentMethod.get(remote.idTemp);

      // ----------------------------------------------------------
      // NO EXISTE LOCALMENTE
      // ----------------------------------------------------------

      if (!local) {
        await db.cashRegisterPaymentMethod.put({
          idTemp: remote.idTemp,

          id: remote.id,

          businessId: remote.businessId ?? businessId,

          cashRegisterId: remote.cashRegisterIdTemp,

          paymentMethod: remote.paymentMethod,

          treasuryAccountIdTemp:
            remote.treasuryAccountIdTemp,

          treasuryAccountId: remote.treasuryAccountId ?? null,

          syncStatus: "SYNCED",

          syncPriority: "HIGH",

          isActive: remote.isActive,

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

      await db.cashRegisterPaymentMethod.put({
        idTemp: remote.idTemp,

        id: remote.id,

        businessId: remote.businessId ?? businessId,

        cashRegisterId: remote.cashRegisterIdTemp,

        paymentMethod: remote.paymentMethod,

        treasuryAccountIdTemp:
          remote.treasuryAccountIdTemp ?? remote.treasuryAccountId,

        treasuryAccountId: remote.treasuryAccountId ?? null,

        syncStatus: "SYNCED",

        syncPriority: "HIGH",

        isActive: remote.isActive,

        createdAt: new Date(remote.createdAt),

        updatedAt: new Date(remote.updatedAt),
      });
    }
  }

  // ============================================================
  // CONTAR PENDIENTES
  // ============================================================

  private async getPendingCount(businessId?: string): Promise<number> {
    const paymentMethods = await db.cashRegisterPaymentMethod
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();

    if (!businessId) {
      return paymentMethods.length;
    }

    return paymentMethods.filter(
      (paymentMethod) => paymentMethod.businessId === businessId,
    ).length;
  }
}

// ================================================================
// SINGLETON
// ================================================================

let cashRegisterPaymentMethodSyncWorker: CashRegisterPaymentMethodSyncWorker | null =
  null;

export function getCashRegisterPaymentMethodSyncWorker() {
  if (!cashRegisterPaymentMethodSyncWorker) {
    cashRegisterPaymentMethodSyncWorker =
      new CashRegisterPaymentMethodSyncWorker();
  }

  return cashRegisterPaymentMethodSyncWorker;
}
