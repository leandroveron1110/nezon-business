export interface UpdateLotInput {
  businessId: string;
  idTemp: string;
  lotNumber?: string;
  expirationDate?: string | null;
  manufactureDate?: string | null;
}