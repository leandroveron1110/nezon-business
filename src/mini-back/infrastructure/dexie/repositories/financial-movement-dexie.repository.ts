// mini-back/infra/dexie/repositories/financial-movement.repository.ts

import { HunayDB } from "../db";
import {
  FinancialMovement,
  FinancialMovementPort,
} from "@/mini-back/core/cash-register-core/public";
import { LocalFinancialMovement } from "../shcema/financial-movement.schema";

export class FinancialMovementDexieRepository implements FinancialMovementPort {
  constructor(private readonly db: HunayDB) {}

  async findByClientMovementId(
    clientMovementId: string,
  ): Promise<FinancialMovement | null> {
    const localRecord = await this.db.financialMovement.get(clientMovementId);
    return localRecord ? this.toCoreDomain(localRecord) : null;
  }

  async findByBusinessAndDateRange(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<FinancialMovement[]> {
    const records = await this.db.financialMovement
      .where("businessId")
      .equals(businessId)
      .and((item) => item.date >= from && item.date <= to)
      .toArray();

    return records
      .map((record) => this.toCoreDomain(record))
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }

  async save(movement: FinancialMovement): Promise<FinancialMovement> {
    const now = new Date();

    // 1. Resolver o generar la clave primaria local de la transacción
    const primaryKey =
      movement.clientMovementId ?? movement.id ?? crypto.randomUUID();

    const existing = await this.db.financialMovement.get(primaryKey);

    // 2. Resolver el ID local/servidor del turno de caja asociado
    const turnIdTemp =
      movement.cashRegisterTurnId ?? existing?.cashRegisterTurnIdTemp;

    if (!turnIdTemp) {
      throw new Error(
        "FinancialMovementDexieRepository Error: No se puede guardar un movimiento sin 'cashRegisterTurnId'.",
      );
    }

    // 3. Calculamos la secuencia si no la trae el movimiento
    const sequence =
      movement.sequence ??
      existing?.sequence ??
      (await this.getNextSequence(turnIdTemp));

    // 4. Mapeo Infraestructura / Dexie
    const localRecord: LocalFinancialMovement = {
      idTemp: primaryKey,
      id: movement.id ?? existing?.id ?? null,
      businessId: movement.businessId,
      userId: movement.userId,
      approvedByUserId: movement.approvedByUserId,

      type: movement.type,
      status: movement.status,
      amount: movement.amount,
      paymentMethod: movement.paymentMethod,
      description: movement.description,
      notes: movement.notes,
      externalReference: movement.externalReference,

      sequence,
      date: movement.date || now,

      orderIdTemp: movement.orderId ?? existing?.orderIdTemp ?? undefined, // 💡 Aseguramos también si acepta null/string
      cashRegisterTurnIdTemp: turnIdTemp, // 💡 TypeScript ahora sabe 100% que es string

      syncStatus:
        existing?.syncStatus === "SYNCED"
          ? "SYNC_PENDING"
          : (existing?.syncStatus ?? "SYNC_PENDING"),
      syncPriority: "HIGH",

      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await this.db.financialMovement.put(localRecord);
    return this.toCoreDomain(localRecord);
  }

  async update(movement: FinancialMovement): Promise<FinancialMovement> {
    return this.save(movement);
  }

  async getNextSequence(cashRegisterTurnIdTemp: string): Promise<number> {
    if (!cashRegisterTurnIdTemp) return 1;

    const lastMovement = await this.db.financialMovement
      .where("cashRegisterTurnIdTemp")
      .equals(cashRegisterTurnIdTemp)
      .reverse()
      .sortBy("sequence");

    return lastMovement.length > 0 ? (lastMovement[0].sequence || 0) + 1 : 1;
  }

  async findByCashRegister(
    cashRegisterId: string,
  ): Promise<FinancialMovement[]> {
    const byTempId = await this.db.financialMovement
      .where("cashRegisterTurnIdTemp")
      .equals(cashRegisterId)
      .toArray();

    const byServerId = await this.db.financialMovement
      .where("cashRegisterTurnId")
      .equals(cashRegisterId)
      .toArray();

    const map = new Map<string, LocalFinancialMovement>();
    [...byTempId, ...byServerId].forEach((item) => {
      map.set(item.idTemp, item);
    });

    return Array.from(map.values())
      .map((r) => this.toCoreDomain(r))
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }

  private toCoreDomain(raw: LocalFinancialMovement): FinancialMovement {
    return {
      id: raw.id ?? raw.idTemp,
      clientMovementId: raw.idTemp,
      businessId: raw.businessId,
      userId: raw.userId,
      approvedByUserId: raw.approvedByUserId,
      cashRegisterTurnId:
        raw.cashRegisterTurnIdTemp ?? raw.cashRegisterTurnId ?? "",
      referenceCashRegisterTurnId: raw.referenceCashRegisterTurnId,
      orderId: raw.orderIdTemp ?? raw.orderId,
      type: raw.type,
      status: raw.status,
      amount: raw.amount,
      paymentMethod: raw.paymentMethod,
      description: raw.description,
      notes: raw.notes,
      externalReference: raw.externalReference,
      sequence: raw.sequence,
      date: new Date(raw.date),
    };
  }
}
