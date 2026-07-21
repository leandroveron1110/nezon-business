import { PaymentMethodTypeFinancial } from "../domain/financial-movement-status.enum";

export interface SaleRegisteredSignal {
  readonly type: 'SALE_REGISTERED';
  readonly payload: {
    movementId: string;
    cashRegisterId: string;
    businessId: string;
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethodTypeFinancial;
    date: Date;
  };
}