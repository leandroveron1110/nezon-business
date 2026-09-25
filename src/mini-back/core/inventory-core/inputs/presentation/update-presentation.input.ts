export interface UpdatePresentationInput {
  businessId: string;
  idTemp: string;
  name?: string;
  conversionFactor?: number;
  barcode?: string | null;
}