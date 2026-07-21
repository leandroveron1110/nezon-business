import { FinancialMovement } from "../domain/financial-movement";
import {
  FinancialMovementStatus,
  FinancialMovementType,
} from "../domain/financial-movement-status.enum";

import { CashRegisterPort } from "../port/cash-register.port";
import { FinancialMovementPort } from "../port/financial-movement.port";

import { RegisterExpenseInput } from "../input/register-expense.input";
import { RegisterIncomeInput } from "../input/register-income.input";
import { RegisterRefundInput } from "../input/register-refund.input";
import { RegisterSaleInput } from "../input/register-sale.input";

export class FinancialMovementService {
  constructor(
    private readonly cashRegister: CashRegisterPort,
    private readonly movement: FinancialMovementPort,
  ) {}

  async registerSale(
    input: RegisterSaleInput,
  ): Promise<FinancialMovement> {
    const cashRegister = await this.cashRegister.findActive(input.businessId);

    if (!cashRegister) {
      throw new Error("No existe una caja abierta.");
    }

    const financialMovement: FinancialMovement = {
      id: crypto.randomUUID(),

      clientMovementId: input.clientMovementId,

      businessId: input.businessId,

      userId: input.userId,

      type: FinancialMovementType.SALE,

      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,

      paymentMethod: input.paymentMethod,

      description: input.description,

      notes: input.notes,

      externalReference: input.externalReference,

      sequence: 1,

      date: new Date(),

      orderId: input.orderId,

      cashRegisterTurnId: cashRegister.id,
    };

    return this.movement.save(financialMovement);
  }

  async registerRefund(
    input: RegisterRefundInput,
  ): Promise<FinancialMovement> {
    const cashRegister = await this.cashRegister.findActive(input.businessId);

    if (!cashRegister) {
      throw new Error("No existe una caja abierta.");
    }

    const financialMovement: FinancialMovement = {
      id: crypto.randomUUID(),

      clientMovementId: input.clientMovementId,

      businessId: input.businessId,

      userId: input.userId,

      approvedByUserId: input.userId,

      type: FinancialMovementType.REFUND,

      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,

      paymentMethod: input.paymentMethod,

      description: input.description,

      notes: input.notes,

      externalReference: input.externalReference,

      sequence: 1,

      date: new Date(),

      orderId: input.orderId,

      cashRegisterTurnId: cashRegister.id,

      referenceCashRegisterTurnId: input.referenceCashRegisterTurnId,
    };

    return this.movement.save(financialMovement);
  }

  async registerIncome(
    input: RegisterIncomeInput,
  ): Promise<FinancialMovement> {
    const cashRegister = await this.cashRegister.findActive(input.businessId);

    if (!cashRegister) {
      throw new Error("No existe una caja abierta.");
    }

    const financialMovement: FinancialMovement = {
      id: crypto.randomUUID(),

      clientMovementId: input.clientMovementId,

      businessId: input.businessId,

      userId: input.userId,

      approvedByUserId: input.approvedByUserId,

      type: FinancialMovementType.INCOME,

      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,

      paymentMethod: input.paymentMethod,

      description: input.description,

      notes: input.notes,

      externalReference: input.externalReference,

      sequence: 1,

      date: new Date(),

      cashRegisterTurnId: cashRegister.id,
    };

    return this.movement.save(financialMovement);
  }

  async registerExpense(
    input: RegisterExpenseInput,
  ): Promise<FinancialMovement> {
    const cashRegister = await this.cashRegister.findActive(input.businessId);

    if (!cashRegister) {
      throw new Error("No existe una caja abierta.");
    }

    const financialMovement: FinancialMovement = {
      id: crypto.randomUUID(),

      clientMovementId: input.clientMovementId,

      businessId: input.businessId,

      userId: input.userId,

      approvedByUserId: input.approvedByUserId,

      type: FinancialMovementType.EXPENSE,

      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,

      paymentMethod: input.paymentMethod,

      description: input.description,

      notes: input.notes,

      externalReference: input.externalReference,

      sequence: 1,

      date: new Date(),

      cashRegisterTurnId: cashRegister.id,
    };

    return this.movement.save(financialMovement);
  }
}