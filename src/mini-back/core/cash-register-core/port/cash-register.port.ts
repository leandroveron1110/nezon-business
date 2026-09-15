import { CashRegister } from "../domain/cash-register/cash-register";

export interface CashRegisterPort {
  exist(id: string): Promise<boolean>;
  save(register: CashRegister): Promise<CashRegister>;
  findByIdTemp(idTemp: string): Promise<CashRegister | null>;
  findByBusinessId(businessId: string): Promise<CashRegister[]>;
  findByName(businessId: string, name: string): Promise<CashRegister | null>;
}

export interface CashRegisterValidationPort {
  existsByIdTemp(cashRegisterId: string, businessId: string): Promise<boolean>;
}

export interface TreasuryAccountValidationPort {
  existsAndIsActive(treasuryAccountId: string, businessId: string): Promise<boolean>;
}
