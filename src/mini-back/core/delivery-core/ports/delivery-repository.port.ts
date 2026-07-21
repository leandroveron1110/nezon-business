import { Delivery } from "../domain/delivery.entity";

export interface DeliveryRepositoryPort {
   save(delivery: Delivery): Promise<void>;

   update(
      orderId: string,
      updates: Partial<Delivery>
   ): Promise<void>;

   findByOrderId(orderId: string): Promise<Delivery | null>;
}