import { CashRegister } from "../domain/cash-register";
import { CashRegisterStatus } from "../domain/cash-register-status.enum";
import { CashRegisterTotals } from "../domain/cash-register-totals";
import {
  FinancialMovementStatus,
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "../domain/financial-movement-status.enum";

import { CloseCashRegisterInput } from "../input/close.input";
import { HistoryFiltersInput } from "../input/hitory-filter.input";
import { InitializeCashRegisterInput } from "../input/initialize.input";
import { OpenCashRegisterInput } from "../input/open.input";

import { CashRegisterPort } from "../port/cash-register.port";
import { FinancialMovementPort } from "../port/financial-movement.port";
import { ICashRegisterService } from "../public/cash-register-service.interface";

export class CashRegisterService implements ICashRegisterService {
  constructor(
    private readonly cashRegister: CashRegisterPort,
    private readonly financialMovement: FinancialMovementPort,
  ) {}
  reopen(businessId: string, turnId: string): Promise<CashRegister> {
    throw new Error("Method not implemented.");
  }

  async initialize(input: InitializeCashRegisterInput): Promise<CashRegister> {
    const active = await this.cashRegister.findActive(input.businessId);

    if (active) {
      return active;
    }

    return this.open({
      businessId: input.businessId,
      userId: input.userId,
      clientTurnId: input.clientTurnId, // Opcional: si viene de la app cliente/UI
      openingAmount: input.openingAmount,
      openingNotes: input.openingNotes,
    });
  }

  async historyCashRegiter(filter: HistoryFiltersInput): Promise<CashRegister[]> {
    if (!filter.businessId) {
      throw new Error(
        "El businessId es requerido para consultar el historial.",
      );
    }

    // 1. Consultar a través de tu repositorio/capa de datos (IndexedDB/Dexie)
    // Se filtran por negocio y se ordenan por apertura descendente (más recientes primero)
    let turns = await this.cashRegister.findByBusinessId(filter.businessId);

    // 2. Aplicar filtros en memoria si vienen especificados
    if (filter?.startDate) {
      turns = turns.filter(
        (turn) => new Date(turn.openingDate) >= filter.startDate!,
      );
    }

    if (filter?.endDate) {
      turns = turns.filter(
        (turn) => new Date(turn.openingDate) <= filter.endDate!,
      );
    }

    // 3. Ordenar siempre los más recientes primero
    turns.sort(
      (a, b) =>
        new Date(b.openingDate).getTime() - new Date(a.openingDate).getTime(),
    );

    // 4. Paginación / Límite
    const offset = filter?.offset || 0;
    const limit = filter?.limit;

    if (limit) {
      return turns.slice(offset, offset + limit);
    }

    return turns;
  }

  async open(input: OpenCashRegisterInput): Promise<CashRegister> {
    // 1. Idempotencia: Si la UI mandó un ID local previo, verificamos si ya existe
    if (input.clientTurnId) {
      const existingClient = await this.cashRegister.findByClientTurnId(
        input.clientTurnId,
      );
      if (existingClient) {
        return existingClient;
      }
    }

    // 2. Regla de Negocio: Solo una caja abierta por negocio
    const active = await this.cashRegister.findActive(input.businessId);
    if (active) {
      throw new Error("Ya existe una caja abierta para este negocio.");
    }

    // 3. Creación del objeto de dominio SIN forzar UUIDs de Infraestructura
    const cashRegister: Partial<CashRegister> = {
      clientTurnId: input.clientTurnId,
      businessId: input.businessId,
      openedByUserId: input.userId,
      openingDate: new Date(),
      openingAmount: input.openingAmount,
      openingNotes: input.openingNotes,
      status: CashRegisterStatus.OPEN,
    };

    // El repositorio se encarga de asignar el ID definitivo/local si no viene uno
    return this.cashRegister.save(cashRegister as CashRegister);
  }

  // 🛠️ DENTRO DE CashRegisterService.ts (Método close)

  async close(input: CloseCashRegisterInput): Promise<CashRegister> {
    const turn = await this.cashRegister.findActive(input.businessId);

    if (!turn) {
      throw new Error("No existe una caja abierta para este negocio.");
    }

    const turnIdentifier = turn.clientTurnId || turn.id;

    if (!turnIdentifier) {
      throw new Error("El turno activo no posee un identificador válido.");
    }

    // 1. Totales de movimientos del turno (Neto operado)
    const totals = await this.getActiveTurnTotals(input.businessId);

    const netCashOperated = totals.cash;
    const openingAmount = turn.openingAmount || 0;

    // 2. El dinero esperado TOTAL en el cajón físico (Fondo + Neto Operado)
    const totalExpectedInDrawer = openingAmount + netCashOperated;

    // 3. Mutación limpia de la entidad de dominio
    turn.closedByUserId = input.userId;
    turn.closingDate = new Date();
    turn.declaredClosingAmount = input.declaredClosingAmount;

    // Guardamos el neto operado en systemClosingAmount
    turn.systemClosingAmount = netCashOperated;

    // 💥 REGLA DE NEGOCIO CORREGIDA:
    // Arqueo = Declarado - Esperado Real en Cajón
    turn.difference = input.declaredClosingAmount - totalExpectedInDrawer;

    turn.closingNotes = input.closingNotes;
    turn.status = CashRegisterStatus.CLOSED;

    return this.cashRegister.close(turn);
  }

  async getActiveTurnTotals(businessId: string): Promise<CashRegisterTotals> {
    const turn = await this.cashRegister.findActive(businessId);
    if (!turn || !turn.id) {
      return { cash: 0, card: 0, transfer: 0, total: 0 };
    }

    const movements = await this.financialMovement.findByCashRegister(turn.id);

    return movements.reduce(
      (acc, m) => {
        if (m.status !== FinancialMovementStatus.CONFIRMED) return acc;

        const isExpenseOrRefund =
          m.type === FinancialMovementType.EXPENSE ||
          m.type === FinancialMovementType.REFUND;

        const amount = isExpenseOrRefund ? -m.amount : m.amount;

        acc.total += amount;

        switch (m.paymentMethod) {
          case PaymentMethodTypeFinancial.CASH:
            acc.cash += amount;
            break;
          case PaymentMethodTypeFinancial.CREDIT_CARD:
          case PaymentMethodTypeFinancial.DEBIT_CARD:
            acc.card += amount;
            break;
          case PaymentMethodTypeFinancial.TRANSFER:
            acc.transfer += amount;
            break;
        }

        return acc;
      },
      {
        cash: 0,
        card: 0,
        transfer: 0,
        total: 0,
      },
    );
  }
}
