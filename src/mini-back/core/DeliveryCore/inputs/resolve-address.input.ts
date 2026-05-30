// src/core/delivery/inputs/resolve-address.input.ts

import { LocationSuggestion } from "../domain/delivery.types";

export interface ResolveAddressInput {
  rawAddress: string;

  locations: LocationSuggestion[];
}