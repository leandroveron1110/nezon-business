import { FinancialMovementPort } from "../port/financial-movement/financial-movement.port";
import { TreasuryAccountPort } from "../port/treasury-account/treasury-account.port";
import { FinancialMovementService } from "../service/financial-movement/financial-movement.service";
import { TreasuryAccountService } from "../service/treasury-account/treasury-account.service";
import { ITreasuryAccountPublicService } from "./treasury-account-service.interface";

export const FinancialMovementServicePublic = (dependencies: {
  financialMovement: FinancialMovementPort;
}) => {
  return new FinancialMovementService(dependencies.financialMovement);
};

export const TreasuryAccountServicePublic = (dependencies: {
  treasuryAccount: TreasuryAccountPort;
  financialMovement: FinancialMovementPort;
}): ITreasuryAccountPublicService => {
  return new TreasuryAccountService(
    dependencies.treasuryAccount,
    dependencies.financialMovement,
  );
}


export * from './financial-movement-service.interface'
export * from './treasury-account-service.interface'

export * from '../domain/financial-movement/financial-movement'
export * from '../domain/financial-movement/financial-movement-status.enum'
export * from '../domain/treasury-account/treasury-account'

export * from '../input/financial-movement/register-cogs.Input'
export * from '../input/financial-movement/register-expense.input'
export * from '../input/financial-movement/register-income.input'
export * from '../input/financial-movement/register-refund.input'
export * from '../input/financial-movement/register-sale.input'
export * from '../input/financial-movement/register-merma.input'

export * from '../input/treasury-account/create-treasury-account.input'
export * from '../input/treasury-account/update-treasury-account.input'

export * from '../port/financial-movement/financial-movement.port'
export * from '../port/treasury-account/treasury-account.port'

export * from '../signal/financial-movement/expense-registered.signal'
export * from '../signal/financial-movement/income-registered.signal'
export * from '../signal/financial-movement/refund-registered.signal'
export * from '../signal/financial-movement/sale-registered.signal'
