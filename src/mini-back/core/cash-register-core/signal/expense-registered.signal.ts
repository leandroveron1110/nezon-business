import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface ExpenseRegisteredSignal {
  readonly type: 'EXPENSE_REGISTERED';
  readonly payload: {
    movementId: string;
    cashRegisterId: string;
    businessId: string;
    amount: number;
    paymentMethod: PaymentMethodTypeFinancial;
    date: Date;
  };
}