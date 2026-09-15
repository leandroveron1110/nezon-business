// treasury-core/input/treasury-account/create-treasury-account.input.ts

import { TreasuryAccountType } from "../../domain/treasury-account/treasury-account";

export interface CreateTreasuryAccountInput {

  id: string;
  businessId: string;

  name: string;

  type: TreasuryAccountType;

  currency: string;
}