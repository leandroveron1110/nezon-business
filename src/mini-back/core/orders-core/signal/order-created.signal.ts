export interface OrderCreatedSignal {
  orderId: string;

  createdAt: Date;

  syncRequired: boolean;

  printRequired: boolean;
}