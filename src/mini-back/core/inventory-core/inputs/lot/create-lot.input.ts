export interface CreateLotInput {
  businessId: string;
  idTemp: string;
  inventoryProductIdTemp: string;
  lotNumber: string;
  expirationDate?: string | null;
  manufactureDate?: string | null;
}