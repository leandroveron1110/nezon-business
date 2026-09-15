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
import { RegisterInternalTransferInput } from "../../input/financial-movement/register-internal-transfer.input";
import { RegisterMermaInput } from "../../input/financial-movement/register-merma.input";
import { RegisterRefundInput } from "../../input/financial-movement/register-refund.input";
import { RegisterSaleInput } from "../../input/financial-movement/register-sale.input";
import { FinancialMovementPort } from "../../port/financial-movement/financial-movement.port";
import { IFinancialMovementPublicService } from "../../public/financial-movement-service.interface";
import { FianancialTotals } from "../../signal/financial-movement/financial-movement-totals.signal";

export class FinancialMovementService implements IFinancialMovementPublicService {
  constructor(private readonly movement: FinancialMovementPort) {}

  async getActiveTurnTotals(idTemp: string): Promise<FianancialTotals> {
    const movements = await this.movement.findByCashRegister(idTemp);

    return movements.reduce(
      (acc, m) => {
        if (m.status !== FinancialMovementStatus.CONFIRMED) return acc;

        if (m.cashRegisterTurnId !== idTemp) return acc;

        if (m.type === FinancialMovementType.COGS) return acc;

        console.log(m.amount, m.cashRegisterTurnId);

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
      cashRegisterTurnId: input.idTemp,

      type: FinancialMovementType.SALE,
      status: FinancialMovementStatus.CONFIRMED,

      treasuryAccountId: input.treasuryAccountId,

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

      cashRegisterTurnId: input.idTemp,

      treasuryAccountId: input.treasuryAccountId,

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
      cashRegisterTurnId: input.idTemp,

      type: FinancialMovementType.INCOME,
      status: FinancialMovementStatus.CONFIRMED,

      treasuryAccountId: input.treasuryAccountId,

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
      cashRegisterTurnId: input.idTemp,

      treasuryAccountId: input.treasuryAccountId,

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

  async registerInternalTransfer(
    input: RegisterInternalTransferInput,
  ): Promise<FinancialMovement[]> {
    if (input.sourceTreasuryAccountId === input.destinationTreasuryAccountId) {
      throw new Error(
        "Source and destination treasury accounts must be different",
      );
    }

    if (input.amount <= 0) {
      throw new Error("Transfer amount must be greater than zero");
    }

    const now = new Date();

    const outgoingMovement: FinancialMovement = {
      clientMovementId: input.outgoingClientMovementId,

      businessId: input.businessId,

      userId: input.userId,

      treasuryAccountId: input.sourceTreasuryAccountId,

      transferGroupId: input.transferGroupId,

      type: FinancialMovementType.INTERNAL_TRANSFER_OUT,

      status: FinancialMovementStatus.CONFIRMED,

      amount: -input.amount,

      description: input.description,

      notes: input.notes,

      externalReference: input.externalReference,

      date: now,
    };

    const incomingMovement: FinancialMovement = {
      clientMovementId: input.incomingClientMovementId,

      businessId: input.businessId,

      userId: input.userId,

      treasuryAccountId: input.destinationTreasuryAccountId,

      transferGroupId: input.transferGroupId,

      type: FinancialMovementType.INTERNAL_TRANSFER_IN,

      status: FinancialMovementStatus.CONFIRMED,

      amount: input.amount,

      description: input.description,

      notes: input.notes,

      externalReference: input.externalReference,

      date: now,
    };

    return this.movement.saveMany([outgoingMovement, incomingMovement]);
  }

  // 📦 REGISTRO DE COSTO DE MERCADERÍA (COGS)
  async registerCogs(input: RegisterCogsInput): Promise<FinancialMovement> {
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: input.idTemp,

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

  async registerMerma(input: RegisterMermaInput): Promise<FinancialMovement> {
    const financialMovement: FinancialMovement = {
      clientMovementId: input.clientMovementId,
      businessId: input.businessId,
      userId: input.userId,
      cashRegisterTurnId: input.idTemp,

      type: FinancialMovementType.MERMAS,
      status: FinancialMovementStatus.CONFIRMED,

      treasuryAccountId: input.treasuryAccountId,

      amount: input.amount,
      description: input.description,
      notes: input.notes,

      date: new Date(),
      orderId: input.orderId,
    };

    return this.movement.save(financialMovement);
  }
}
