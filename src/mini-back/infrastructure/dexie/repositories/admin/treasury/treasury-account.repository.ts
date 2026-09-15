// mini-back/infra/dexie/repositories/treasury-account.repository.ts

import {
  TreasuryAccount,
  TreasuryAccountPort,
} from "@/mini-back/core/treasury-core/public";
import { db, HunayDB } from "../../../db";

import { LocalTreasuryAccount } from "../../../shcema/treasury-account.schema";

export class TreasuryAccountDexieRepository implements TreasuryAccountPort {
  /**
   * Guarda una cuenta de tesorería.
   *
   * Si la cuenta ya existe localmente, actualiza
   * sus datos conservando la información de
   * sincronización correspondiente.
   *
   * Si no existe, crea un nuevo registro local
   * pendiente de sincronización.
   */
  async save(account: TreasuryAccount): Promise<TreasuryAccount> {
    const existing = await db.treasuryAccount.get(account.idTemp);

    const localAccount: LocalTreasuryAccount = {
      idTemp: account.idTemp || crypto.randomUUID(),
      businessId: account.businessId,
      syncStatus:
        existing?.syncStatus === "SYNCED"
          ? "SYNC_PENDING"
          : (existing?.syncStatus ?? "SYNC_PENDING"),
      syncPriority: "HIGH",
      name: account.name,
      type: account.type,
      currency: account.currency,
      currentBalance: account.currentBalance,
      isActive: account.isActive,
      createdAt: existing?.createdAt ?? account.createdAt,
      updatedAt: account.updatedAt,
    };

    await db.treasuryAccount.put(localAccount);

    return this.toCoreDomain(localAccount);
  }

  /**
   * Busca una cuenta de tesorería por su
   * identificador local.
   *
   * Devuelve null cuando la cuenta no existe.
   */
  async findById(accountId: string): Promise<TreasuryAccount | null> {
    const account = await db.treasuryAccount.get(accountId);

    if (!account) {
      return null;
    }

    return this.toCoreDomain(account);
  }

  /**
   * Obtiene todas las cuentas de tesorería
   * pertenecientes a un negocio.
   *
   * Incluye cuentas activas e inactivas.
   */
  async findByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    console.log("Finding treasury accounts for businessId:", businessId);
    const accounts = await db.treasuryAccount
      .where("businessId")
      .equals(businessId)
      .toArray();

    return accounts.map((account) => this.toCoreDomain(account));
  }

  /**
   * Obtiene únicamente las cuentas activas
   * pertenecientes a un negocio.
   *
   * Estas cuentas son las disponibles para
   * nuevas operaciones financieras.
   */
  async findActiveByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    const accounts = await db.treasuryAccount
      .where("businessId")
      .equals(businessId)
      .and((account) => account.isActive)
      .toArray();

    return accounts.map((account) => this.toCoreDomain(account));
  }

  /**
   * Busca una cuenta por negocio y nombre.
   *
   * Se utiliza principalmente para validar
   * que no existan dos cuentas con el mismo
   * nombre dentro del mismo negocio.
   */
  async findByBusinessIdAndName(
    businessId: string,
    name: string,
  ): Promise<TreasuryAccount | null> {
    const account = await db.treasuryAccount
      .where("businessId")
      .equals(businessId)
      .filter((account) => account.name === name)
      .first();

    if (!account) {
      return null;
    }

    return this.toCoreDomain(account);
  }

  /**
   * Convierte el modelo local de IndexedDB
   * al dominio puro utilizado por Treasury Core.
   *
   * De esta forma Dexie y sus detalles de
   * sincronización nunca salen de infraestructura.
   */
  private toCoreDomain(account: LocalTreasuryAccount): TreasuryAccount {
    return {
      idTemp: account.idTemp,
      businessId: account.businessId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      currentBalance: account.currentBalance,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
