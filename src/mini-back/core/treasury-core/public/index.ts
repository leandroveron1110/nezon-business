import { FinancialMovementPort } from "../port/financial-movement/financial-movement.port";
import { FinancialMovementService } from "../service/financial-movement/financial-movement.service";

export const FinancialMovementServicePublic = (dependencies: {
  financialMovement: FinancialMovementPort;
}) => {
  return new FinancialMovementService(dependencies.financialMovement);
};

export * from './financial-movement-service.interface'

export * from '../domain/financial-movement/financial-movement'
export * from '../domain/financial-movement/financial-movement-status.enum'

export * from '../input/financial-movement/register-cogs.Input'
export * from '../input/financial-movement/register-expense.input'
export * from '../input/financial-movement/register-income.input'
export * from '../input/financial-movement/register-refund.input'
export * from '../input/financial-movement/register-sale.input'

export * from '../port/financial-movement/financial-movement.port'

export * from '../signal/financial-movement/expense-registered.signal'
export * from '../signal/financial-movement/income-registered.signal'
export * from '../signal/financial-movement/refund-registered.signal'
export * from '../signal/financial-movement/sale-registered.signal'
