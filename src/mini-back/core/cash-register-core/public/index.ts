import { CashRegisterPaymentMethodPort } from "../port/cash-register-payment-method/cash-register-payment-method.port";
import { CashRegisterTurnPort } from "../port/cash-register-turn.port";
import {
  CashRegisterPort,
  CashRegisterValidationPort,
  TreasuryAccountValidationPort,
} from "../port/cash-register.port";
import { CashRegisterPaymentMethodService } from "../service/cash-register-payment-method.service";
import { CashRegisterTurnService } from "../service/cash-register-turn.service";
import { CashRegisterService } from "../service/cash-register.service";

// --- EXPORTACIONES DE DOMINIO ---
export * from "../domain/cash-register-turn-status.enum";
export * from "../domain/cash-register-turn";
export * from "../domain/cash-summary";
export * from "../domain/closing-result";
export * from "../domain/cash-register-totals-turn";

// --- EXPORTACIONES DE INPUTS ---
export * from "../input/calculate-closing-amount.input";
export * from "../input/calculate-summary.input";
export * from "../input/close.input";
export * from "../input/initialize.input";
export * from "../input/open.input";
export * from "../input/hitory-filter.input";

// --- EXPORTACIONES DE INPUTS ---
export * from "../port/cash-register-turn.port";

// -- EXPORTACIONES DE SERVICES ---
export const CashRegisterTurnServicePublic = (
  cashRegisterTurn: CashRegisterTurnPort,
  cashRegister: CashRegisterPort,
) => {
  return new CashRegisterTurnService(cashRegisterTurn, cashRegister);
};

export const CashRegisterServicePublic = (
  cashRegister: CashRegisterPort,
  treasuryAccountValidationPort: TreasuryAccountValidationPort,
) => {
  return new CashRegisterService(cashRegister, treasuryAccountValidationPort);
};

export const CashRegisterPaymentMethodServicePublic = (
  cashRegisterPaymentMethodPort: CashRegisterPaymentMethodPort,
  cashRegisterValidationPort: CashRegisterValidationPort,
  treasuryAccountValidationPort: TreasuryAccountValidationPort,
) => {
  return new CashRegisterPaymentMethodService(
    cashRegisterPaymentMethodPort,
    cashRegisterValidationPort,
    treasuryAccountValidationPort,
  );
};


export * from "../domain/cash-register-payment-method/cash-register-payment-method"
export * from "../input/cash-register-payment-method/create-cash-register-payment-method.input"
export * from "../input/cash-register-payment-method/update-cash-register-payment-method.input"

export * from "../port/cash-register-payment-method/cash-register-payment-method.port"



export * from "./cash-register-service.interface";
export * from "../domain/cash-register/cash-register";
export * from "../input/cash-register/create-cash-register.input";
export * from "../input/cash-register/update-cash-register.input";
export * from "../port/cash-register.port";
export * from "../service/cash-register.service";
