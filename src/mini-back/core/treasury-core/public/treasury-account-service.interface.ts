// treasury-core/public/treasury-account-service.interface.ts

import { TreasuryAccount } from "../domain/treasury-account/treasury-account";

import { CreateTreasuryAccountInput } from "../input/treasury-account/create-treasury-account.input";
import { UpdateTreasuryAccountInput } from "../input/treasury-account/update-treasury-account.input";

export interface ITreasuryAccountPublicService {
  create(input: CreateTreasuryAccountInput): Promise<TreasuryAccount>;

  update(input: UpdateTreasuryAccountInput): Promise<TreasuryAccount>;

  findById(accountId: string): Promise<TreasuryAccount | null>;

  findByBusinessId(businessId: string): Promise<TreasuryAccount[]>;

  findActiveByBusinessId(businessId: string): Promise<TreasuryAccount[]>;

  deactivate(accountId: string): Promise<TreasuryAccount>;

  activate(accountId: string): Promise<TreasuryAccount>;

  recalculateBalance(
    businessId: string,
    treasuryAccountId: string,
  ): Promise<TreasuryAccount>;
}
