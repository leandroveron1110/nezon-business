// mini-back/core/cash-register-core/service/financial-movement.service.ts

import { FinancialMovement } from "../domain/financial-movement";
import {
  FinancialMovementStatus,
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "../domain/financial-movement-status.enum";

import { CashRegisterPort } from "../port/cash-register.port";
import { FinancialMovementPort } from "../port/financial-movement.port";

import { RegisterExpenseInput } from "../input/register-expense.input";
import { RegisterIncomeInput } from "../input/register-income.input";
import { RegisterRefundInput } from "../input/register-refund.input";
import { RegisterSaleInput } from "../input/register-sale.input";
import { IFinancialMovementPublicService } from "../public/financial-movement-service.interface";
import { RegisterCogsInput } from "../input/register-cogs.Input";

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
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: activeBox.clientTurnId,

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

    const isFromPreviousTurn =
      input.referenceCashRegisterTurnId &&
      input.referenceCashRegisterTurnId !== activeBox.clientTurnId;

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.userId,

      cashRegisterTurnId: activeBox.clientTurnId,

      type: FinancialMovementType.REFUND,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      notes: input.notes,
      externalReference: input.externalReference,

      date: new Date(),
      orderId: input.orderId,

      referenceCashRegisterTurnId: isFromPreviousTurn
        ? input.referenceCashRegisterTurnId
        : undefined,
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
      cashRegisterTurnId: activeBox.clientTurnId,

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

  async registerExpense(
    input: RegisterExpenseInput,
  ): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.approvedByUserId,
      cashRegisterTurnId: activeBox.clientTurnId,

      type: FinancialMovementType.EXPENSE,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      notes: input.notes,
      externalReference: input.externalReference,

      date: new Date(),
      orderId: input.orderId, // Útil si la merma proviene de una orden cancelada
    };

    return this.movement.save(financialMovement);
  }

  // 📦 REGISTRO DE COSTO DE MERCADERÍA (COGS)
  async registerCogs(input: RegisterCogsInput): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: activeBox.clientTurnId,

      type: FinancialMovementType.COGS,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      description: input.description,
      notes: input.notes,

      date: new Date(),
      orderId: input.orderId,
    };

    return this.movement.save(financialMovement);
  }

  async registerMerma(input: RegisterCogsInput): Promise<FinancialMovement> {
    const activeBox = await this.getActiveCashRegisterOrThrow(input.businessId);

    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: activeBox.clientTurnId,

      type: FinancialMovementType.MERMAS,
      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,
      description: input.description,
      notes: input.notes,

      date: new Date(),
      orderId: input.orderId,
    };

    return this.movement.save(financialMovement);
  }
}
