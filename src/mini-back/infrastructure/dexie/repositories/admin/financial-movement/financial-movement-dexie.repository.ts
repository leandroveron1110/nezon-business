// mini-back/infra/dexie/repositories/financial-movement.repository.ts

import {
  FinancialMovement,
  FinancialMovementPort,
} from "@/mini-back/core/treasury-core/public";
import { HunayDB } from "../../../db";
import { LocalFinancialMovement } from "../../../shcema/financial-movement.schema";
import {
  FinancialMovementStatus,
  FinancialMovementType,
} from "@/mini-back/shared/enums/financial-movement-status.enum";

export class FinancialMovementDexieRepository implements FinancialMovementPort {
  constructor(private readonly db: HunayDB) {}

  async findByOrderId(orderId: string): Promise<FinancialMovement | null> {
    const localRecord = await this.db.financialMovement
      .where("orderIdTemp")
      .equals(orderId)
      .first();
    return localRecord ? this.toCoreDomain(localRecord) : null;
  }

  async findByClientMovementId(
    clientMovementId: string,
  ): Promise<FinancialMovement | null> {
    const localRecord = await this.db.financialMovement.get(clientMovementId);
    return localRecord ? this.toCoreDomain(localRecord) : null;
  }

  async calculateBalanceByTreasuryAccount(
    accountIdTemp: string,
    businessId: string,
  ): Promise<number> {
    // Buscamos todos los movimientos pertenecientes
    // a esta cuenta de Tesorería.
    const movements = await this.db.financialMovement
      .where("treasuryAccountIdTemp")
      .equals(accountIdTemp)
      .and((item) => item.businessId === businessId)
      .toArray();

    return movements.reduce((balance, movement) => {
      if (movement.status !== FinancialMovementStatus.CONFIRMED) {
        return balance;
      }
      const impact = this.getMovementBalanceImpact(movement);

      // --------------------------------------------------
      // 3. APLICAMOS EL IMPACTO AL SALDO
      // --------------------------------------------------

      return balance + impact;
    }, 0);
  }

  private getMovementBalanceImpact(movement: LocalFinancialMovement): number {
    const amount = Math.abs(movement.amount);

    switch (movement.type) {
      // ================================================
      // ENTRADAS DE DINERO
      // ================================================
      //
      // Estos movimientos aumentan el saldo de la cuenta.

      case FinancialMovementType.SALE:
        // Una venta cobrada mete dinero en la cuenta.
        //
        // Ejemplo:
        // Caja = $10.000
        // Venta = $2.000
        // Nuevo saldo = $12.000
        return amount;

      case FinancialMovementType.INCOME:
        // Un ingreso también mete dinero.
        //
        // Ejemplo:
        // "El dueño puso $5.000 en caja"
        //
        // Caja = $10.000
        // Ingreso = $5.000
        // Nuevo saldo = $15.000
        return amount;

      case FinancialMovementType.INTERNAL_TRANSFER_IN:
        // Una transferencia interna recibida
        // aumenta esta cuenta.
        //
        // Ejemplo:
        //
        // Banco → Caja
        //
        // Banco:
        //   -$10.000
        //
        // Caja:
        //   +$10.000
        return amount;

      // ================================================
      // SALIDAS DE DINERO
      // ================================================
      //
      // Estos movimientos disminuyen el saldo.

      case FinancialMovementType.REFUND:
        // Una devolución devuelve dinero al cliente.
        //
        // Por lo tanto, el dinero SALE de la caja.
        //
        // Ejemplo:
        // Caja = $10.000
        // Devolución = $2.000
        // Nuevo saldo = $8.000
        //
        // Da igual si amount vino como +2000 o -2000.
        // Nosotros ya hicimos Math.abs().
        return -amount;

      case FinancialMovementType.EXPENSE:
        // Un gasto saca dinero de la cuenta.
        //
        // Ejemplo:
        // "Compramos bolsas por $3.000"
        //
        // Caja = $10.000
        // Gasto = $3.000
        // Nuevo saldo = $7.000
        return -amount;

      case FinancialMovementType.MERMAS:
        // Una merma representa dinero/valor que se pierde
        // y que queremos reflejar como salida de Tesorería.
        //
        // Por eso disminuye el saldo.
        return -amount;

      case FinancialMovementType.INTERNAL_TRANSFER_OUT:
        // Una transferencia interna enviada
        // disminuye esta cuenta.
        //
        // Ejemplo:
        //
        // Caja → Banco
        //
        // Caja:
        //   -$10.000
        //
        // Banco:
        //   +$10.000
        return -amount;

      // ================================================
      // NO IMPACTA TESORERÍA
      // ================================================

      case FinancialMovementType.COGS:
        // COGS = costo de mercadería vendida.
        //
        // Esto puede afectar resultados contables,
        // pero NO significa que en este momento
        // haya salido dinero de esta cuenta.
        //
        // Ejemplo:
        //
        // Vendimos una hamburguesa que nos costó $3.000.
        //
        // El costo existe.
        // Pero el movimiento de costo no representa
        // necesariamente una salida de $3.000 de la caja
        // en este momento.
        //
        // Por eso NO modifica el saldo de Tesorería.
        return 0;

      // ================================================
      // TIPO NO CONTEMPLADO
      // ================================================

      default:
        // Si aparece un tipo nuevo y todavía no definimos
        // cómo afecta Tesorería, por seguridad no
        // modificamos el saldo.
        return 0;
    }
  }

  /**
   * Guarda múltiples movimientos financieros
   * de forma atómica.
   *
   * Esta operación se utiliza cuando una única
   * operación de negocio genera múltiples
   * movimientos financieros relacionados.
   *
   * Ejemplo:
   *
   * Transferencia interna:
   *
   * Mercado Pago  -$50.000
   * Caja          +$50.000
   *
   * Si alguno de los movimientos no puede
   * guardarse, la transacción completa falla
   * y ninguno queda persistido.
   */
  async saveMany(movements: FinancialMovement[]): Promise<FinancialMovement[]> {
    if (movements.length === 0) {
      return [];
    }

    /**
     * Construimos todos los registros antes
     * de iniciar la transacción.
     *
     * De esta manera cualquier error de
     * transformación se detecta antes de
     * realizar escrituras.
     */
    const localRecords = await Promise.all(
      movements.map((movement) => this.toLocalRecord(movement)),
    );

    /**
     * Guardamos todos los movimientos dentro
     * de una única transacción de IndexedDB.
     *
     * Esto garantiza atomicidad:
     *
     * - Se guardan todos.
     * - O no se guarda ninguno.
     */
    await this.db.transaction("rw", this.db.financialMovement, async () => {
      await this.db.financialMovement.bulkPut(localRecords);
    });

    return localRecords.map((record) => this.toCoreDomain(record));
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
    const localRecord = await this.toLocalRecord(movement);

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

  /**
   * Convierte un FinancialMovement del dominio
   * en su representación local para Dexie.
   *
   * Este método concentra toda la lógica de
   * persistencia local para evitar que save()
   * y saveMany() tengan implementaciones
   * duplicadas.
   */
  private async toLocalRecord(
    movement: FinancialMovement,
  ): Promise<LocalFinancialMovement> {
    const now = new Date();

    /**
     * Resolver la clave primaria local.
     *
     * clientMovementId tiene prioridad porque
     * representa el identificador generado por
     * el cliente.
     */
    const primaryKey =
      movement.clientMovementId ?? movement.id ?? crypto.randomUUID();

    const existing = await this.db.financialMovement.get(primaryKey);

    /**
     * El turno de caja es opcional.
     *
     * Un movimiento financiero puede pertenecer
     * directamente a una cuenta de tesorería
     * sin existir dentro de un turno de caja.
     *
     * Ejemplo:
     *
     * Banco → Mercado Pago
     */
    const turnIdTemp =
      movement.cashRegisterTurnId ?? existing?.cashRegisterTurnIdTemp;

    /**
     * Resolver la secuencia.
     *
     * La secuencia solo puede calcularse a partir
     * de un turno de caja.
     *
     * Si el movimiento no pertenece a una caja,
     * utilizamos una secuencia independiente.
     */
    const sequence =
      movement.sequence ??
      existing?.sequence ??
      (turnIdTemp ? await this.getNextSequence(turnIdTemp) : 0);

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

      /**
       * Relaciones.
       */
      orderIdTemp: movement.orderId ?? existing?.orderIdTemp ?? undefined,

      cashRegisterTurnIdTemp: turnIdTemp,

      referenceCashRegisterTurnId: movement.referenceCashRegisterTurnId,

      /**
       * Cuenta de tesorería afectada.
       */
      treasuryAccountIdTemp:
        movement.treasuryAccountId ?? existing?.treasuryAccountIdTemp,

      /**
       * Identificador que relaciona movimientos
       * pertenecientes a una misma transferencia.
       */
      transferGroupId: movement.transferGroupId ?? existing?.transferGroupId,

      /**
       * Sincronización.
       */
      syncStatus:
        existing?.syncStatus === "SYNCED"
          ? "SYNC_PENDING"
          : (existing?.syncStatus ?? "SYNC_PENDING"),

      syncPriority: "HIGH",

      createdAt: existing?.createdAt ?? now,

      updatedAt: now,
    };

    return localRecord;
  }
}
