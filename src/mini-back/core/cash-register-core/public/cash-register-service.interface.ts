import { CashRegister } from "../domain/cash-register/cash-register";
import { CreateCashRegisterInput } from "../input/cash-register/create-cash-register.input";
import { UpdateCashRegisterInput } from "../input/cash-register/update-cash-register.input";

export interface ICashRegisterService {
  create(input: CreateCashRegisterInput): Promise<CashRegister>;
  update(input: UpdateCashRegisterInput): Promise<CashRegister>;
  toggleActive(idTemp: string, businessId: string): Promise<CashRegister>;
  findById(idTemp: string, businessId: string): Promise<CashRegister>;
  findByBusinessId(businessId: string): Promise<CashRegister[]>;
  findActiveByBusinessId(businessId: string): Promise<CashRegister[]>;
}
