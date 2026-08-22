// mini-back/core/tresury-core/service/financial-movement.service.ts

import { FinancialMovement } from "../../domain/financial-movement/financial-movement";
import {
  FinancialMovementStatus,
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "../../domain/financial-movement/financial-movement-status.enum";
import { RegisterCogsInput } from "../../input/financial-movement/register-cogs.Input";
import { RegisterExpenseInput } from "../../input/financial-movement/register-expense.input";
import { RegisterIncomeInput } from "../../input/financial-movement/register-income.input";
import { RegisterRefundInput } from "../../input/financial-movement/register-refund.input";
import { RegisterSaleInput } from "../../input/financial-movement/register-sale.input";
import { FinancialMovementPort } from "../../port/financial-movement/financial-movement.port";
import { IFinancialMovementPublicService } from "../../public/financial-movement-service.interface";
import { FianancialTotals } from "../../signal/financial-movement/financial-movement-totals.signal";

export class FinancialMovementService implements IFinancialMovementPublicService {
  constructor(private readonly movement: FinancialMovementPort) {}

  async getActiveTurnTotals(clientTurnId: string): Promise<FianancialTotals> {
    const movements = await this.movement.findByCashRegister(clientTurnId);

    return movements.reduce(
      (acc, m) => {
        if (m.status !== FinancialMovementStatus.CONFIRMED) return acc;

        if(m.cashRegisterTurnId !== clientTurnId) return acc;

        if(m.type === FinancialMovementType.COGS ) return acc;

        console.log(m.amount, m.cashRegisterTurnId)

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

  async registerSale(input: RegisterSaleInput): Promise<FinancialMovement> {
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: input.clientTurnId,

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
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.userId,

      cashRegisterTurnId: input.clientTurnId,

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
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.approvedByUserId,
      cashRegisterTurnId: input.clientTurnId,

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
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      approvedByUserId: input.approvedByUserId,
      cashRegisterTurnId: input.clientTurnId,

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
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: input.clientTurnId,

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
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: input.clientTurnId,

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
