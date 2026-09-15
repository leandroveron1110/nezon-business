import { CashRegisterPort } from "@/mini-back/core/cash-register-core/port/cash-register.port";
import { db } from "../../db";
import { CashRegister } from "@/mini-back/core/cash-register-core/domain/cash-register/cash-register";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export class CashRegisterDexieRepository implements CashRegisterPort {
  async save(register: CashRegister): Promise<CashRegister> {
    // Usamos idTemp como clave primaria local en IndexedDB/Dexie
    await db.cashRegister.put({
      businessId: register.businessId,
      idTemp: register.idTemp,
      id: register.id ?? null,
      name: register.name,
      defaultTreasuryAccountId: register.defaultTreasuryAccountId,
      isActive: register.isActive,
      createdAt: register.createdAt,
      syncPriority: "HIGH",
      syncStatus: "PENDING" as SyncStatus,
      updatedAt: register.updatedAt,
    });
    return register;
  }

  async findByIdTemp(idTemp: string): Promise<CashRegister | null> {
    const register = await db.cashRegister.get(idTemp);
    return register ?? null;
  }

  async findByBusinessId(businessId: string): Promise<CashRegister[]> {
    return await db.cashRegister
      .where("businessId")
      .equals(businessId)
      .toArray();
  }

  async findByName(
    businessId: string,
    name: string,
  ): Promise<CashRegister | null> {
    // Búsqueda por índice compuesto (businessId + name) o filtrado local
    const register = await db.cashRegister
      .where("[businessId+name]")
      .equals([businessId, name])
      .first();

    return register ?? null;
  }

  async exist(idTemp: string): Promise<boolean> {
    const count = await db.cashRegister.where("idTemp").equals(idTemp).count();
    return count > 0;
  }
}
