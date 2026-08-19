import { FinancialMovement } from "../domain/financial-movement";

import { RegisterSaleInput } from "../input/register-sale.input";
import { RegisterRefundInput } from "../input/register-refund.input";
import { RegisterIncomeInput } from "../input/register-income.input";
import { RegisterExpenseInput } from "../input/register-expense.input";
import { RegisterCogsInput } from "../input/register-cogs.Input";

export interface IFinancialMovementPublicService {
  registerSale(input: RegisterSaleInput): Promise<FinancialMovement>;

  registerRefund(input: RegisterRefundInput): Promise<FinancialMovement>;

  registerIncome(input: RegisterIncomeInput): Promise<FinancialMovement>;

  registerExpense(input: RegisterExpenseInput): Promise<FinancialMovement>;

  registerCogs(input: RegisterCogsInput): Promise<FinancialMovement>;
  
  registerMerma(input: RegisterCogsInput): Promise<FinancialMovement>
}
