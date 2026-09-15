import { CashRegisterValidationPort } from "@/mini-back/core/cash-register-core/public";
import { db } from "../../db";

export class CashRegisterValidationRepository implements CashRegisterValidationPort {
  async existsByIdTemp(
    cashRegisterId: string,
    businessId: string,
  ): Promise<boolean> {
    const cashRegister = await db.cashRegister
      .where("[businessId+idTemp]")
      .equals([businessId, cashRegisterId])
      .first();

    return !!cashRegister;
  }
}
