// src/infrastructure/dexie/repositories/dexie-cash-register-payment-method.repository.ts

import { db } from "../../db";
import { LocalCashRegisterPaymentMethod } from "../../shcema/cash-register-payment-method.schema";

export class DexieCashRegisterPaymentMethodRepository {
  async getPending(): Promise<LocalCashRegisterPaymentMethod[]> {
    return db.cashRegisterPaymentMethod
      .where("syncStatus")
      .anyOf(["LOCAL_ONLY", "SYNC_PENDING", "SYNC_ERROR"])
      .toArray();
  }

  async getByBusinessId(
    businessId: string,
  ): Promise<LocalCashRegisterPaymentMethod[]> {
    return db.cashRegisterPaymentMethod
      .where("businessId")
      .equals(businessId)
      .toArray();
  }

  async getByCashRegisterId(
    cashRegisterId: string,
  ): Promise<LocalCashRegisterPaymentMethod[]> {
    return db.cashRegisterPaymentMethod
      .where("cashRegisterId")
      .equals(cashRegisterId)
      .toArray();
  }

  async getByIdTemp(
    idTemp: string,
  ): Promise<LocalCashRegisterPaymentMethod | undefined> {
    return db.cashRegisterPaymentMethod.get(idTemp);
  }

  async save(paymentMethod: LocalCashRegisterPaymentMethod): Promise<void> {
    await db.cashRegisterPaymentMethod.put(paymentMethod);
  }

  async markSynced(idTemp: string, serverId: string): Promise<void> {
    await db.cashRegisterPaymentMethod.update(idTemp, {
      id: serverId,
      syncStatus: "SYNCED",
    });
  }

  async markError(idTemp: string): Promise<void> {
    await db.cashRegisterPaymentMethod.update(idTemp, {
      syncStatus: "SYNC_ERROR",
    });
  }

  async markPending(idTemp: string): Promise<void> {
    await db.cashRegisterPaymentMethod.update(idTemp, {
      syncStatus: "SYNC_PENDING",
    });
  }
}
