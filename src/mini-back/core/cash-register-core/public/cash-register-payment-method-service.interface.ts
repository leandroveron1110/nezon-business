import { CashRegisterPaymentMethod } from "../domain/cash-register-payment-method/cash-register-payment-method";
import { CreateCashRegisterPaymentMethodInput } from "../input/cash-register-payment-method/create-cash-register-payment-method.input";
import { UpdateCashRegisterPaymentMethodInput } from "../input/cash-register-payment-method/update-cash-register-payment-method.input";

export interface ICashRegisterPaymentMethodService {
  create(
    input: CreateCashRegisterPaymentMethodInput,
  ): Promise<CashRegisterPaymentMethod>;

  update(
    input: UpdateCashRegisterPaymentMethodInput,
  ): Promise<CashRegisterPaymentMethod>;

  toggleActive(
    idTemp: string,
    businessId: string,
  ): Promise<CashRegisterPaymentMethod>;

  findByCashRegisterId(
    cashRegisterId: string,
    businessId: string,
  ): Promise<CashRegisterPaymentMethod[]>;

  resolveTreasuryAccountId(
    cashRegisterId: string,
    paymentMethod: string,
    businessId: string,
  ): Promise<string>;
}
