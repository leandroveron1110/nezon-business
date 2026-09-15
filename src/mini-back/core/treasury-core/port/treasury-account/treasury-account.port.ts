// treasury-core/port/treasury-account/treasury-account.port.ts

import { TreasuryAccount } from "../../domain/treasury-account/treasury-account";

export interface TreasuryAccountPort {
  save(account: TreasuryAccount): Promise<TreasuryAccount>;

  findById(accountId: string): Promise<TreasuryAccount | null>;

  findByBusinessId(businessId: string): Promise<TreasuryAccount[]>;

  findActiveByBusinessId(
    businessId: string,
  ): Promise<TreasuryAccount[]>;

  findByBusinessIdAndName(
    businessId: string,
    name: string,
  ): Promise<TreasuryAccount | null>;
}