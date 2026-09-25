export interface CreateLocationInput {
  businessId: string;
  idTemp: string;
  code?: string | null;
  name: string;
  description?: string | null;
  isDefault: boolean;
}