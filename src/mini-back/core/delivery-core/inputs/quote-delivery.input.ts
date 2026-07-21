import { LocationSuggestion } from "../domain/delivery.types";

export interface QuoteDeliveryInput {
   businessId: string;

   rawAddress: string;

   provider: "PLATFORM" | "INTERNAL";

   locations: LocationSuggestion[];
}