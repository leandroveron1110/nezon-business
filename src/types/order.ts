export interface User {
  id: string;
  fullName: string;
  phone: string;
  address?: string | null; // dirección completa como string
  avatarId?: string | null;
}

export interface Bussiness {
  name: string;
  address: string; // dirección completa como string
  phone: string;
}

export interface OrderOption {
  id: string;
  opcionId?: string | null;
  optionName: string;
  priceFinal: number;
  priceWithoutTaxes: number;
  taxesAmount: number;
  priceModifierType: string;
  quantity: number;
}

export interface OrderOptionGroup {
  id: string;
  opcionGrupoId?: string | null;
  groupName: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: string;
  options: OrderOption[];
}

export type ProductPaymentMethod = 'TRANSFER' | 'CASH'

export interface OrderItem {
  id: string;
  productName: string;
  productDescription?: string | null;
  productImageUrl?: string | null;
  productPaymentMethod: ProductPaymentMethod;
  quantity: number;
  priceAtPurchase: number;
  notes?: string | null;
  optionGroups: OrderOptionGroup[];
}

export interface OrderDiscount {
  id: string;
  amount: number;
  type: string;
  notes?: string | null;
  paidBy?: string | null;
}



export enum DeliveryType {
  PICKUP = "PICKUP", // El cliente retira en el local
  DELIVERY = "DELIVERY",
  IN_HOUSE_DELIVERY = "IN_HOUSE_DELIVERY", // El negocio entrega por su cuenta
  EXTERNAL_DELIVERY = "EXTERNAL_DELIVERY", // Se usa una cadetería externa
}

export enum PaymentMethodType {
  TRANSFER = "TRANSFER",
  CASH = "CASH",
  QR = "QR",
  OTHER="OTHER"
}

/// Estados de pago de una orden
export enum PaymentStatus {
  PENDING = "PENDING", /// Pago pendiente (cliente aún no inició)
  IN_PROGRESS = "IN_PROGRESS", /// Pago en curso (por ejemplo, transferencia en proceso)
  CONFIRMED = "CONFIRMED", /// Pago confirmado (negocio recibió el dinero)
  REJECTED = "REJECTED", /// Pago rechazado o fallido
  PAID ="PAID"
}

export enum OrderStatus {
  // 1. Creación y pago
  PENDING = "PENDING",                         // Pedido creado (sin pago y sin confirmar)
  WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT", // Pedido esperando pago
  PAYMENT_IN_PROGRESS = "PAYMENT_IN_PROGRESS", // Pago en curso
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",     // Pago confirmado

  // 2. Confirmación y preparación en negocio
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION", // Esperando que el negocio acepte
  CONFIRMED = "CONFIRMED",                       // Negocio aceptó el pedido
  REJECTED_BY_BUSINESS = "REJECTED_BY_BUSINESS", // Negocio rechazó antes de preparar
  PREPARING = "PREPARING",                       // Pedido en preparación

  // 2.1 Pedido listo
  READY_FOR_CUSTOMER_PICKUP = "READY_FOR_CUSTOMER_PICKUP", // Pedido listo para retiro por el cliente
  READY_FOR_DELIVERY_PICKUP = "READY_FOR_DELIVERY_PICKUP", // Pedido listo y negocio llamó al delivery

  // 3. Asignación de delivery
  DELIVERY_PENDING = "DELIVERY_PENDING",         // Buscando delivery para asignar
  DELIVERY_ASSIGNED = "DELIVERY_ASSIGNED",       // Delivery asignado, esperando aceptación
  DELIVERY_ACCEPTED = "DELIVERY_ACCEPTED",       // Delivery aceptó la asignación
  DELIVERY_REJECTED = "DELIVERY_REJECTED",       // Delivery rechazó la asignación
  DELIVERY_REASSIGNING = "DELIVERY_REASSIGNING", // Buscando otro delivery tras rechazo

  // 4. Transporte
  OUT_FOR_PICKUP = "OUT_FOR_PICKUP",             // Delivery yendo al negocio a buscar el pedido
  PICKED_UP = "PICKED_UP",                       // Pedido recogido por el delivery
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",         // Delivery en camino al cliente

  // 5. Entrega y finalización
  DELIVERED = "DELIVERED",                       // Pedido entregado con éxito
  DELIVERY_FAILED = "DELIVERY_FAILED",           // No se pudo entregar el pedido
  RETURNED = "RETURNED",                         // Pedido devuelto al negocio
  REFUNDED = "REFUNDED",                         // Dinero devuelto al cliente
  COMPLETED = "COMPLETED",                       // Pedido cerrado y finalizado

  // 6. Cancelaciones
  CANCELLED_BY_USER = "CANCELLED_BY_USER",       // Cancelado por el cliente
  CANCELLED_BY_BUSINESS = "CANCELLED_BY_BUSINESS", // Cancelado por el negocio
  CANCELLED_BY_DELIVERY = "CANCELLED_BY_DELIVERY", // Cancelado por el delivery

  // 7. Errores generales
  FAILED = "FAILED"                              // Error general (pago rechazado, problema interno)
}


export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // 1. Creación y pago
  [OrderStatus.PENDING]: [OrderStatus.WAITING_FOR_PAYMENT, OrderStatus.CANCELLED_BY_USER, OrderStatus.FAILED],
  [OrderStatus.WAITING_FOR_PAYMENT]: [OrderStatus.PAYMENT_IN_PROGRESS, OrderStatus.CANCELLED_BY_USER, OrderStatus.FAILED],
  [OrderStatus.PAYMENT_IN_PROGRESS]: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.FAILED],
  [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.PENDING_CONFIRMATION],

  // 2. Confirmación y preparación
  [OrderStatus.PENDING_CONFIRMATION]: [OrderStatus.CONFIRMED, OrderStatus.REJECTED_BY_BUSINESS, OrderStatus.CANCELLED_BY_USER],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED_BY_BUSINESS],
  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_DELIVERY_PICKUP, OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.CANCELLED_BY_BUSINESS],
  [OrderStatus.REJECTED_BY_BUSINESS]: [],

  // 2.1 Pedido listo
  [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED_BY_BUSINESS],
  [OrderStatus.READY_FOR_DELIVERY_PICKUP]: [OrderStatus.DELIVERY_PENDING, OrderStatus.CANCELLED_BY_BUSINESS],

  // 3. Asignación de delivery
  [OrderStatus.DELIVERY_PENDING]: [OrderStatus.DELIVERY_ASSIGNED, OrderStatus.CANCELLED_BY_BUSINESS],
  [OrderStatus.DELIVERY_ASSIGNED]: [OrderStatus.DELIVERY_ACCEPTED, OrderStatus.DELIVERY_REJECTED, OrderStatus.CANCELLED_BY_DELIVERY],
  [OrderStatus.DELIVERY_ACCEPTED]: [OrderStatus.OUT_FOR_PICKUP, OrderStatus.DELIVERY_REJECTED],
  [OrderStatus.DELIVERY_REJECTED]: [OrderStatus.DELIVERY_REASSIGNING, OrderStatus.CANCELLED_BY_DELIVERY],
  [OrderStatus.DELIVERY_REASSIGNING]: [OrderStatus.DELIVERY_ASSIGNED, OrderStatus.CANCELLED_BY_BUSINESS],

  // 4. Transporte
  [OrderStatus.OUT_FOR_PICKUP]: [OrderStatus.PICKED_UP, OrderStatus.DELIVERY_FAILED],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],

  // 5. Entrega y finalización
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.RETURNED, OrderStatus.DELIVERY_PENDING],
  [OrderStatus.RETURNED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],

  // 6. Cancelaciones
  [OrderStatus.CANCELLED_BY_USER]: [],
  [OrderStatus.CANCELLED_BY_BUSINESS]: [],
  [OrderStatus.CANCELLED_BY_DELIVERY]: [],

  // 7. Errores generales
  [OrderStatus.FAILED]: [OrderStatus.PENDING] // Posibilidad de reintento
};

export const canTransition = (current: OrderStatus, next: OrderStatus): boolean => {
  // 1. Permitir cancelación/rechazo si no está finalizado
  if (next.startsWith('CANCELLED_') || next === OrderStatus.REJECTED_BY_BUSINESS) {
    const finalStatuses: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.COMPLETED];
    return !finalStatuses.includes(current);
  }

  // 2. Verificación normal por mapa
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
};

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.IN_PROGRESS, PaymentStatus.CONFIRMED, PaymentStatus.REJECTED],
  [PaymentStatus.IN_PROGRESS]: [PaymentStatus.CONFIRMED, PaymentStatus.REJECTED],
  [PaymentStatus.CONFIRMED]: [], // Estado final
  [PaymentStatus.REJECTED]: [PaymentStatus.PENDING, PaymentStatus.IN_PROGRESS], // Reintento
  [PaymentStatus.PAID]:[]
};

export type Origin = 'APP' | 'BUSINESS'

export interface IOrderShortDto {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  deliveryType: DeliveryType;
  orderPaymentMethod: PaymentMethodType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  origin: Origin
}

export type Actor = 'CUSTOMER' | 'BUSINESS' | 'DELIVERY';

export const ACTOR_VISIBILITY: Record<Actor, OrderStatus[]> = {
  CUSTOMER: [
    OrderStatus.PENDING, OrderStatus.WAITING_FOR_PAYMENT, OrderStatus.PAYMENT_CONFIRMED,
    OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_CUSTOMER_PICKUP,
    OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.COMPLETED
  ],
  BUSINESS: [
    OrderStatus.PENDING_CONFIRMATION, OrderStatus.CONFIRMED, OrderStatus.PREPARING,
    OrderStatus.READY_FOR_DELIVERY_PICKUP, OrderStatus.READY_FOR_CUSTOMER_PICKUP,
    OrderStatus.PICKED_UP, OrderStatus.DELIVERED, OrderStatus.COMPLETED,
    OrderStatus.CANCELLED_BY_USER, OrderStatus.REJECTED_BY_BUSINESS
  ],
  DELIVERY: [
    OrderStatus.READY_FOR_DELIVERY_PICKUP, OrderStatus.DELIVERY_PENDING,
    OrderStatus.DELIVERY_ASSIGNED, OrderStatus.DELIVERY_ACCEPTED, 
    OrderStatus.OUT_FOR_PICKUP, OrderStatus.PICKED_UP, 
    OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED
  ]
};

export const canViewStatus = (actor: Actor, status: OrderStatus): boolean => {
  return ACTOR_VISIBILITY[actor].includes(status);
};
