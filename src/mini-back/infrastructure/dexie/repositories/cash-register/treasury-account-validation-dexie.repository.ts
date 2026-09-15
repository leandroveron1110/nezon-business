import { TreasuryAccountValidationPort } from "@/mini-back/core/cash-register-core/port/cash-register.port";
import { db } from "../../db";

export class TreasuryAccountValidationDexieAdapter implements TreasuryAccountValidationPort {
  async existsAndIsActive(treasuryAccountId: string, businessId: string): Promise<boolean> {
    const account = await db.treasuryAccount.get(treasuryAccountId);
    return !!account && account.isActive;
  }
}
