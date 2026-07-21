// src/data/location-search-data.ts

import { LocationSuggestion } from "@/mini-back/core/delivery-core/public";
import { LOCATION_ALIASES } from "./location-aliases";
import { STREET_SUGGESTIONS } from "./street-suggestions";

export const LOCATION_DATA: LocationSuggestion[] = [
  // 🟦 BARRIOS
  ...LOCATION_ALIASES,

  // 🟩 CALLES
  ...STREET_SUGGESTIONS,
];