// src/mini-back/core/deliverycore/domain/delivery.types.ts
export type SuggestionType = "BARRIO" | "CALLE";

export interface BaseSuggestion {
  id: string;
  name: string;
  normalized: string;
  tokens?: string[];
  aliases?: string[];
  active?: boolean
}

export interface LocationRule {
  id: string;
  tokens: string[];
  priority: number;
  zoneId: string;
}

export interface BarrioSuggestion extends BaseSuggestion {
  type: "BARRIO";
  zoneId: string;
  rules?: LocationRule[];
  
}

export interface CalleSuggestion extends BaseSuggestion {
  type: "CALLE";
}

export type LocationSuggestion = BarrioSuggestion | CalleSuggestion;