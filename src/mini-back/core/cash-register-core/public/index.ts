import { CashRegisterPort } from "../port/cash-register.port";
import { FinancialMovementPort } from "../port/financial-movement.port";
import { CashRegisterService } from "../service/cash-register.service";

// --- EXPORTACIONES DE DOMINIO ---
export * from "../domain/cash-register-status.enum";
export * from "../domain/cash-register";
export * from "../domain/cash-summary";
export * from "../domain/closing-result";
export * from "../domain/cash-register-totals";

// --- EXPORTACIONES DE INPUTS ---
export * from "../input/calculate-closing-amount.input";
export * from "../input/calculate-summary.input";
export * from "../input/close.input";
export * from "../input/initialize.input";
export * from "../input/open.input";
export * from "../input/hitory-filter.input";

// --- EXPORTACIONES DE INPUTS ---
export * from "../port/cash-register.port";

// -- EXPORTACIONES DE SERVICES ---
export const CashRegisterServicePublic = (dependencies: {
  cashRegister: CashRegisterPort;
}) => {
  return new CashRegisterService(
    dependencies.cashRegister  );
};

