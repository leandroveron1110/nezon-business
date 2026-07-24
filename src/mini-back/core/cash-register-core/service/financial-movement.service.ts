// mini-back/core/cash-register-core/service/financial-movement.service.ts

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
import { IFinancialMovementPublicService } from "../public/financial-movement-service.interface";

export class FinancialMovementService implements IFinancialMovementPublicService {
  constructor(
    private readonly cashRegister: CashRegisterPort,
    private readonly movement: FinancialMovementPort,
  ) {}

  private async getActiveCashRegisterOrThrow(businessId: string) {
    const cashRegister = await this.cashRegister.findActive(businessId);

    if (!cashRegister) {
      throw new Error("No existe una caja abierta para este negocio.");
    }

    return cashRegister;
  }

  async registerSale(input: RegisterSaleInput): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId, // Opcional si la UI mandó id de idempotencia local
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: activeBox.id, // ID unificado del turno según la entidad de dominio

      type: FinancialMovementType.SALE,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      notes: input.notes,
      externalReference: input.externalReference,

      date: new Date(),
      orderId: input.orderId,
    };

    return this.movement.save(financialMovement);
  }

  async registerRefund(input: RegisterRefundInput): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.userId,
      cashRegisterTurnId: activeBox.id,

      type: FinancialMovementType.REFUND,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      notes: input.notes,
      externalReference: input.externalReference,

      date: new Date(),
      orderId: input.orderId,
      referenceCashRegisterTurnId: input.referenceCashRegisterTurnId,
    };

    return this.movement.save(financialMovement);
  }

  async registerIncome(input: RegisterIncomeInput): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.approvedByUserId,
      cashRegisterTurnId: activeBox.id,

      type: FinancialMovementType.INCOME,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      notes: input.notes,
      externalReference: input.externalReference,

      date: new Date(),
    };

    return this.movement.save(financialMovement);
  }

  async registerExpense(input: RegisterExpenseInput): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.approvedByUserId,
      cashRegisterTurnId: activeBox.id,

      type: FinancialMovementType.EXPENSE,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      notes: input.notes,
      externalReference: input.externalReference,

      date: new Date(),
    };

    return this.movement.save(financialMovement);
  }
}