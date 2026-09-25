export interface CreateProductInput {
  businessId: string;
  idTemp: string;
  name: string;
  code?: string | null;
  description?: string | null;
  baseUnitIdTemp?: string;
  minStock?: number | null;
  maxStock?: number | null;
  trackLots: boolean;
}