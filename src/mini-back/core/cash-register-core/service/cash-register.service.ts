import { CashRegister } from "../domain/cash-register";
import { CashRegisterStatus } from "../domain/cash-register-status.enum";
import { CashRegisterTotals } from "../domain/cash-register-totals";
import {
  FinancialMovementStatus,
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "../domain/financial-movement-status.enum";

import { CloseCashRegisterInput } from "../input/close.input";
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

  async close(input: CloseCashRegisterInput): Promise<CashRegister> {
    const turn = await this.cashRegister.findActive(input.businessId);

    if (!turn) {
      throw new Error("No existe una caja abierta para este negocio.");
    }

    // 💡 Identificador seguro (funciona local y sincronizado)
    const turnIdentifier = turn.clientTurnId || turn.id;

    if (!turnIdentifier) {
      throw new Error("El turno activo no posee un identificador válido.");
    }

    // 1. Reusamos el cálculo de totales del Core
    const totals = await this.getActiveTurnTotals(input.businessId);

    // 2. El arqueo en efectivo es el total en caja calculado por el sistema
    const cashSystemAmount = totals.cash;

    // 3. Mutamos la entidad de dominio con la información de cierre
    turn.closedByUserId = input.userId;
    turn.closingDate = new Date();
    turn.declaredClosingAmount = input.declaredClosingAmount;
    turn.systemClosingAmount = cashSystemAmount;
    turn.difference = input.declaredClosingAmount - cashSystemAmount;
    turn.closingNotes = input.closingNotes;
    turn.status = CashRegisterStatus.CLOSED;

    // 4. Persistimos los cambios
    return this.cashRegister.close(turn);
  }

  // En CashRegisterService.ts

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
