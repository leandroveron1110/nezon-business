import { FinancialMovement } from "../domain/financial-movement/financial-movement";

import { RegisterSaleInput } from "../input/financial-movement/register-sale.input";
import { RegisterRefundInput } from "../input/financial-movement/register-refund.input";
import { RegisterIncomeInput } from "../input/financial-movement/register-income.input";
import { RegisterExpenseInput } from "../input/financial-movement/register-expense.input";
import { RegisterCogsInput } from "../input/financial-movement/register-cogs.Input";
import { FianancialTotals } from "../signal/financial-movement/financial-movement-totals.signal";

export interface IFinancialMovementPublicService {
  registerSale(input: RegisterSaleInput): Promise<FinancialMovement>;

  registerRefund(input: RegisterRefundInput): Promise<FinancialMovement>;

  registerIncome(input: RegisterIncomeInput): Promise<FinancialMovement>;

  registerExpense(input: RegisterExpenseInput): Promise<FinancialMovement>;

  registerCogs(input: RegisterCogsInput): Promise<FinancialMovement>;
  
  registerMerma(input: RegisterCogsInput): Promise<FinancialMovement>

  getActiveTurnTotals(clientTurnId: string): Promise<FianancialTotals>
}
