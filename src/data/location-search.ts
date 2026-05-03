export type SuggestionType = "BARRIO" | "CALLE";

export interface BaseSuggestion {
  id: string;
  name: string;
  normalized: string;
  tokens?: string[];
  aliases?: string[];
}

export interface BarrioSuggestion extends BaseSuggestion {
  type: "BARRIO";
  zoneId: string;
}

export interface CalleSuggestion extends BaseSuggestion {
  type: "CALLE";
}

export type LocationSuggestion = BarrioSuggestion | CalleSuggestion;