import { v4 as uuidv4 } from "uuid";
import { LocalOrder, LocalOrderItem } from "../shcema/orders.schema";
import { db } from "..";

import { z } from 'zod';

export const CreateOrderSchema = z.object({
  customerName: z.string().min(3, "El nombre es requerido"),
  customerPhone: z.string().min(8, "Teléfono inválido"),
  customerAddress: z.string().optional(),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  // Lo que hablamos del cliente:
  deliveryProvider: z.enum(['PLATFORM', 'INTERNAL']),
  deliveryPriceMode: z.enum(['AUTOMATIC', 'MANUAL']),
  totalDeliveryCost: z.number().min(0),
  orderPaymentMethod: z.enum(['CASH', 'TRANSFER', 'QR', 'DELIVERY']),
  items: z.array(z.custom<LocalOrderItem>()).min(1, "Debe agregar al menos un producto"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export async function createManualOrderCommand(
  orderData: Omit<LocalOrder, 'idTemp' | 'syncStatus' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const newOrder: LocalOrder = {
    ...orderData,
    idTemp: uuidv4(),
    syncStatus: 'pending_creation',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.orders.add(newOrder);
  return newOrder.idTemp;
}


export async function createLocalOrder(input: CreateOrderInput): Promise<LocalOrder> {
  const itemsTotal = input.items.reduce((acc, item) => 
    acc + (item.priceAtPurchase * item.quantity), 0
  );

  const newOrder: LocalOrder = {
    idTemp: crypto.randomUUID(),
    syncStatus: 'pending_creation',
    origin: 'BUSINESS',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Spread del input validado
    ...input,
    
    // Cálculo final de total
    total: itemsTotal + input.totalDeliveryCost,
    paymentStatus: 'PENDING',
  };

  await db.orders.add(newOrder);
  return newOrder;
}