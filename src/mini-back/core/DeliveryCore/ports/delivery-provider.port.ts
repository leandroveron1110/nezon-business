export interface DeliveryProviderPort {
   quote(input: {
      businessId: string;
      latitude: number;
      longitude: number;
   }): Promise<number>;
}