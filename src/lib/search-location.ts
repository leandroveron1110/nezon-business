// src/utils/search-location.ts

import { LocationSuggestion } from "@/data/location-search";
import { LOCATION_DATA } from "@/data/location-search-data";


export function normalizeAddress(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchLocation(query: string): LocationSuggestion[] {
  const q = normalizeAddress(query);
  if (!q) return [];

  return LOCATION_DATA
    .map(item => {
      const base = item.normalized;

      let score = 0;

      if (base.startsWith(q)) score = 5;
      else if (base.includes(q)) score = 4;
      else if (item.aliases?.some(a => normalizeAddress(a).includes(q))) score = 3;
      else if (item.tokens?.some(t => t.startsWith(q))) score = 2;

      return { item, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(r => r.item);
}