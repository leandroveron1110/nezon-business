export interface LocalBusiness {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  updatedAt: number;
}

export const BUSINESS_STORE = "id, name, address, latitude, longitude";