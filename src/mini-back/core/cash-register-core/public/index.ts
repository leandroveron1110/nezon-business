import { CashRegisterPort } from "../port/cash-register.port";
import { FinancialMovementPort } from "../port/financial-movement.port";
import { CashRegisterService } from "../service/cash-register.service";
import { FinancialMovementService } from "../service/financial-movement.service";

// --- EXPORTACIONES DE DOMINIO ---
export * from "../domain/cash-register-status.enum";
export * from "../domain/cash-register";
export * from "../domain/cash-summary";
export * from "../domain/closing-result";
export * from "../domain/financial-movement-status.enum";
export * from "../domain/financial-movement";
export * from "../domain/payment-summary";
export * from "../domain/cash-register-totals"

// --- EXPORTACIONES DE INPUTS ---
export * from "../input/calculate-closing-amount.input";
export * from "../input/calculate-summary.input";
export * from "../input/close.input";
export * from "../input/initialize.input";
export * from "../input/open.input";
export * from "../input/register-expense.input";
export * from "../input/register-income.input";
export * from "../input/register-refund.input";
export * from "../input/register-sale.input";

// --- EXPORTACIONES DE INPUTS ---
export * from "../port/cash-register.port";
export * from "../port/financial-movement.port";


// -- EXPORTACIONES DE SERVICES ---
export const CashRegisterServicePublic = (dependencies: {
  cashRegister: CashRegisterPort;
  financialMovement: FinancialMovementPort;
}) => {
  return new CashRegisterService(
    dependencies.cashRegister,
    dependencies.financialMovement,
  );
};

export const FinancialMovementServicePublic = (dependencies: {
  cashRegister: CashRegisterPort;
  financialMovement: FinancialMovementPort;
}) => {
  return new FinancialMovementService(
    dependencies.cashRegister,
    dependencies.financialMovement,
  );
};
