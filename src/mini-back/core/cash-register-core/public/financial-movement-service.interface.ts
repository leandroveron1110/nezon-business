import { FinancialMovement } from "../domain/financial-movement";

import { RegisterSaleInput } from "../input/register-sale.input";
import { RegisterRefundInput } from "../input/register-refund.input";
import { RegisterIncomeInput } from "../input/register-income.input";
import { RegisterExpenseInput } from "../input/register-expense.input";

export interface IFinancialMovementPublicService {

  registerSale(
    input: RegisterSaleInput,
  ): Promise<FinancialMovementServiceResponse>;

  registerRefund(
    input: RegisterRefundInput,
  ): Promise<FinancialMovementServiceResponse>;

  registerIncome(
    input: RegisterIncomeInput,
  ): Promise<FinancialMovementServiceResponse>;

  registerExpense(
    input: RegisterExpenseInput,
  ): Promise<FinancialMovementServiceResponse>;
}

export interface FinancialMovementServiceResponse {
  success: boolean;

  data?: FinancialMovement;

  error?: {
    code:
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "CONFLICT"
      | "REPOSITORY_ERROR";

    message: string;
  };
}