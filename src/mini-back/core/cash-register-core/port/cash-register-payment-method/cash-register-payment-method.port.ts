import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { CashRegisterPaymentMethod } from "../../domain/cash-register-payment-method/cash-register-payment-method";

export interface CashRegisterPaymentMethodPort {
  save(
    paymentMethod: CashRegisterPaymentMethod,
  ): Promise<CashRegisterPaymentMethod>;

  findByIdTemp(idTemp: string): Promise<CashRegisterPaymentMethod | null>;

  findByCashRegisterId(
    cashRegisterId: string,
  ): Promise<CashRegisterPaymentMethod[]>;

  findByCashRegisterAndPaymentMethod(
    cashRegisterId: string,
    paymentMethod: PaymentMethodTypeFinancial,
  ): Promise<CashRegisterPaymentMethod | null>;

  deleteByIdTemp(idTemp: string): Promise<void>;
}
