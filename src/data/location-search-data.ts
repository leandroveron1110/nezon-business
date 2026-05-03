// src/data/location-search-data.ts

import { LOCATION_ALIASES } from "./location-aliases";
import { LocationSuggestion } from "./location-search";
import { STREET_SUGGESTIONS } from "./street-suggestions";

export const LOCATION_DATA: LocationSuggestion[] = [
  // 🟦 BARRIOS
  ...LOCATION_ALIASES
    .filter(b => b.active)
    .map<LocationSuggestion>((b) => ({
      id: b.id,
      name: b.name,
      normalized: b.normalized,
      tokens: b.tokens,
      type: "BARRIO",
      zoneId: b.zoneId,
    })),

  // 🟩 CALLES
  ...STREET_SUGGESTIONS.map<LocationSuggestion>((s) => ({
    id: s.id,
    name: s.name,
    normalized: s.normalized,
    tokens: s.tokens,
    aliases: s.aliases,
    type: "CALLE",
  })),
];