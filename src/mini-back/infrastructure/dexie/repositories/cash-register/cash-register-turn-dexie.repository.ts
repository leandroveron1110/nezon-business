// Insumos / Entidades que maneja tu Core de Caja
import { HunayDB } from "../../db";
import {
  CashRegisterTurn,
  CashRegisterTurnPort,
  CashRegisterTurnStatus,
} from "@/mini-back/core/cash-register-core/public";
import { LocalCashRegisterTurn } from "../../shcema/cash-register-turn.schema";
import { CashRegisterStatus } from "@/mini-back/shared/enums/cash-register-status.enum";

export class CashRegisterTurnDexieRepository implements CashRegisterTurnPort {
  constructor(private readonly db: HunayDB) {}

  async findActiveByCashRegisterId(
    businessId: string,
    cashRegisterId: string,
  ): Promise<CashRegisterTurn | null> {
    return await this.db.cashRegisterTurn
      .where({
        businessId,
        cashRegisterId,
        status: CashRegisterTurnStatus.OPEN,
      })
      .first()
      .then((record) => (record ? this.toCoreDomain(record) : null));
  }

  async findActive(businessId: string): Promise<CashRegisterTurn | null> {
    const record = await this.db.cashRegisterTurn
      .where({ businessId, status: CashRegisterTurnStatus.OPEN })
      .first();

    return record ? this.toCoreDomain(record) : null;
  }

  async findById(id: string): Promise<CashRegisterTurn | null> {
    let record = await this.db.cashRegisterTurn.get(id);

    if (!record) {
      record = await this.db.cashRegisterTurn.where("id").equals(id).first();
    }

    return record ? this.toCoreDomain(record) : null;
  }

  async findByidTemp(
    idTemp: string,
  ): Promise<CashRegisterTurn | null> {
    const record = await this.db.cashRegisterTurn.get(idTemp);
    return record ? this.toCoreDomain(record) : null;
  }

  // mini-back/infrastructure/dexie/repositories/cash-register-dexie.repository.ts

  async close(CashRegisterTurn: CashRegisterTurn): Promise<CashRegisterTurn> {
    const now = new Date();

    // Garantizamos el ID local
    const idTemp = CashRegisterTurn.idTemp || CashRegisterTurn.id;

    if (!idTemp) {
      throw new Error(
        "No se puede cerrar una caja sin un identificador válido (idTemp o id).",
      );
    }

    const existing = await this.db.cashRegisterTurn.get(idTemp);

    if (!existing) {
      throw new Error(
        `No se encontró el registro local de la caja con ID: ${idTemp}`,
      );
    }

    const closedRecord: LocalCashRegisterTurn = {
      ...existing,
      closedByUserId: CashRegisterTurn.closedByUserId,
      closingDate: CashRegisterTurn.closingDate || now,
      declaredClosingAmount: CashRegisterTurn.declaredClosingAmount,
      systemClosingAmount: CashRegisterTurn.systemClosingAmount,
      difference: CashRegisterTurn.difference,
      closingNotes: CashRegisterTurn.closingNotes,
      status: CashRegisterStatus.CLOSED,

      // Infraestructura: Garantizamos máxima prioridad para subir el cierre al server
      syncStatus: "SYNC_PENDING",
      syncPriority: "HIGH",
      updatedAt: now,
    };

    await this.db.cashRegisterTurn.put(closedRecord);

    return this.toCoreDomain(closedRecord);
  }

  async findByBusinessId(businessId: string): Promise<CashRegisterTurn[]> {
    const result = await this.db.cashRegisterTurn
      .where("businessId")
      .equals(businessId)
      .reverse() // Orden descendente
      .sortBy("openingDate");

    return result.map((r) => this.toCoreDomain(r));
  }

  async save(CashRegisterTurn: CashRegisterTurn): Promise<CashRegisterTurn> {
    const now = new Date();

    // Infraestructura decide la clave primaria local
    const idTemp =
      CashRegisterTurn.idTemp ??
      CashRegisterTurn.id ??
      crypto.randomUUID();

    const existing = await this.db.cashRegisterTurn.get(idTemp);

    const localRecord: LocalCashRegisterTurn = {
      idTemp: idTemp,
     treasuryAccountIdTemp: CashRegisterTurn.treasuryAccountIdTemp,
      id: null,
      businessId: CashRegisterTurn.businessId,
      openedByUserId: CashRegisterTurn.openedByUserId,
      closedByUserId: CashRegisterTurn.closedByUserId,
      openingDate: CashRegisterTurn.openingDate,
      closingDate: CashRegisterTurn.closingDate,
      openingAmount: CashRegisterTurn.openingAmount,
      declaredClosingAmount: CashRegisterTurn.declaredClosingAmount,
      systemClosingAmount: CashRegisterTurn.systemClosingAmount,
      difference: CashRegisterTurn.difference,
      openingNotes: CashRegisterTurn.openingNotes,
      closingNotes: CashRegisterTurn.closingNotes,
      status: CashRegisterTurn.status as unknown as CashRegisterStatus,
      cashRegisterId: CashRegisterTurn.cashRegisterId,

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

  private toCoreDomain(raw: LocalCashRegisterTurn): CashRegisterTurn {
    return {
      id: raw.id ?? raw.idTemp, // El dominio solo ve un 'id' consistente
     treasuryAccountIdTemp: raw.treasuryAccountIdTemp,
      idTemp: raw.idTemp,
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
      cashRegisterId: raw.cashRegisterId,
      status: raw.status as unknown as CashRegisterTurnStatus, // Mapeo entre enums de infraestructura y dominio
    };
  }

  async update(CashRegisterTurn: CashRegisterTurn): Promise<CashRegisterTurn> {
    return this.save(CashRegisterTurn);
  }
}
