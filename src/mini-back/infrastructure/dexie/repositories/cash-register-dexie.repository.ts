import { CashRegisterStatus } from "@/mini-back/shared/enums/cash-register-status.enum";

// Insumos / Entidades que maneja tu Core de Caja
import { HunayDB } from "../db";
import {
  CashRegister,
  CashRegisterPort,
} from "@/mini-back/core/cash-register-core/public";
import { LocalCashRegisterTurn } from "../shcema/cash-register-turn.schema";

export class CashRegisterDexieRepository implements CashRegisterPort {
  constructor(private readonly db: HunayDB) {}

  async findActive(businessId: string): Promise<CashRegister | null> {
    const record = await this.db.cashRegisterTurn
      .where({ businessId, status: CashRegisterStatus.OPEN })
      .first();

    return record ? this.toCoreDomain(record) : null;
  }

  async findById(id: string): Promise<CashRegister | null> {
    let record = await this.db.cashRegisterTurn.get(id);

    if (!record) {
      record = await this.db.cashRegisterTurn.where("id").equals(id).first();
    }

    return record ? this.toCoreDomain(record) : null;
  }

  async findByClientTurnId(clientTurnId: string): Promise<CashRegister | null> {
    const record = await this.db.cashRegisterTurn.get(clientTurnId);
    return record ? this.toCoreDomain(record) : null;
  }

  // mini-back/infrastructure/dexie/repositories/cash-register-dexie.repository.ts

  async close(cashRegister: CashRegister): Promise<CashRegister> {
    const now = new Date();

    // Garantizamos el ID local
    const clientTurnId = cashRegister.clientTurnId || cashRegister.id;

    if (!clientTurnId) {
      throw new Error(
        "No se puede cerrar una caja sin un identificador válido (clientTurnId o id).",
      );
    }

    const existing = await this.db.cashRegisterTurn.get(clientTurnId);

    if (!existing) {
      throw new Error(
        `No se encontró el registro local de la caja con ID: ${clientTurnId}`,
      );
    }

    const closedRecord: LocalCashRegisterTurn = {
      ...existing,
      closedByUserId: cashRegister.closedByUserId,
      closingDate: cashRegister.closingDate || now,
      declaredClosingAmount: cashRegister.declaredClosingAmount,
      systemClosingAmount: cashRegister.systemClosingAmount,
      difference: cashRegister.difference,
      closingNotes: cashRegister.closingNotes,
      status: CashRegisterStatus.CLOSED,

      // Infraestructura: Garantizamos máxima prioridad para subir el cierre al server
      syncStatus: "SYNC_PENDING",
      syncPriority: "HIGH",
      updatedAt: now,
    };

    await this.db.cashRegisterTurn.put(closedRecord);

    return this.toCoreDomain(closedRecord);
  }

  async save(cashRegister: CashRegister): Promise<CashRegister> {
    const now = new Date();

    // Infraestructura decide la clave primaria local
    const clientTurnId =
      cashRegister.clientTurnId ?? cashRegister.id ?? crypto.randomUUID();

    const existing = await this.db.cashRegisterTurn.get(clientTurnId);

    const localRecord: LocalCashRegisterTurn = {
      clientTurnId: clientTurnId,
      id: cashRegister.id ?? existing?.id ?? null, // Si ya vino sync del server se conserva
      businessId: cashRegister.businessId,
      openedByUserId: cashRegister.openedByUserId,
      closedByUserId: cashRegister.closedByUserId,
      openingDate: cashRegister.openingDate,
      closingDate: cashRegister.closingDate,
      openingAmount: cashRegister.openingAmount,
      declaredClosingAmount: cashRegister.declaredClosingAmount,
      systemClosingAmount: cashRegister.systemClosingAmount,
      difference: cashRegister.difference,
      openingNotes: cashRegister.openingNotes,
      closingNotes: cashRegister.closingNotes,
      status: cashRegister.status,

      // Metadata de Infraestructura
      syncStatus:
        existing?.syncStatus === "SYNCED"
          ? "SYNC_PENDING"
          : (existing?.syncStatus ?? "SYNC_PENDING"),
      syncPriority: "HIGH",

      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await this.db.cashRegisterTurn.put(localRecord);
    return this.toCoreDomain(localRecord);
  }

  private toCoreDomain(raw: LocalCashRegisterTurn): CashRegister {
    return {
      id: raw.id ?? raw.clientTurnId, // El dominio solo ve un 'id' consistente
      clientTurnId: raw.clientTurnId,
      businessId: raw.businessId,
      openedByUserId: raw.openedByUserId,
      closedByUserId: raw.closedByUserId,
      openingDate: new Date(raw.openingDate),
      closingDate: raw.closingDate ? new Date(raw.closingDate) : undefined,
      openingAmount: raw.openingAmount,
      declaredClosingAmount: raw.declaredClosingAmount,
      systemClosingAmount: raw.systemClosingAmount,
      difference: raw.difference,
      openingNotes: raw.openingNotes,
      closingNotes: raw.closingNotes,
      status: raw.status,
    };
  }

  async update(cashRegister: CashRegister): Promise<CashRegister> {
    return this.save(cashRegister);
  }
}
