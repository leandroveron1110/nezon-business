// src/common/database/schema/cash-register-payment-method.schema.ts

import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalCashRegisterPaymentMethod {
  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  businessId: string;

  /**
   * Caja física a la que pertenece esta configuración.
   *
   * FK → LocalCashRegister
   */
  cashRegisterId: string;

  /**
   * Medio de pago habilitado para esta caja.
   */
  paymentMethod: PaymentMethodTypeFinancial;

  /**
   * Cuenta de tesorería donde se registra
   * el dinero recibido mediante este medio de pago.
   *
   * FK → LocalTreasuryAccount
   */
  treasuryAccountId: string;

  syncStatus: SyncStatus;
  syncPriority: "HIGH";

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CASH_REGISTER_PAYMENT_METHOD_STORE =
  "idTemp, id, businessId, cashRegisterId, paymentMethod, treasuryAccountId, [cashRegisterId+paymentMethod], isActive";