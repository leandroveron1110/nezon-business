// src/mini-back/infrastructure/dexie/shcema/supplier.schema.ts

import {
  SyncPriority,
  SyncStatus,
} from "@/mini-back/shared/types/sync-status.type";

export interface LocalSupplier {
  // UUID generado localmente.
  idTemp: string;

  // UUID definitivo generado por el backend.
  id?: string | null;

  businessId: string;

  // ---------------------------------------------------------
  // SINCRONIZACIÓN
  // ---------------------------------------------------------

  syncStatus: SyncStatus;
  syncPriority: SyncPriority;

  // ---------------------------------------------------------
  // DATOS DEL PROVEEDOR
  // ---------------------------------------------------------

  name: string;

  // Razón social, si corresponde.
  legalName?: string | null;

  // Identificación fiscal.
  // En Argentina normalmente será CUIT.
  taxId?: string | null;

  // Condición fiscal.
  // La dejamos como string por ahora porque
  // la definición del dominio la vamos a hacer después.
  taxCondition?: string | null;

  // ---------------------------------------------------------
  // CONTACTO
  // ---------------------------------------------------------

  email?: string | null;

  phone?: string | null;

  address?: string | null;

  // ---------------------------------------------------------
  // CONDICIONES COMERCIALES
  // ---------------------------------------------------------

  // Días habituales de plazo de pago.
  paymentTermDays?: number | null;

  // Límite de crédito acordado con el proveedor.
  creditLimit?: number | null;

  // ---------------------------------------------------------
  // ESTADO
  // ---------------------------------------------------------

  isActive: boolean;

  // ---------------------------------------------------------
  // AUDITORÍA LOCAL
  // ---------------------------------------------------------

  createdAt: Date;

  updatedAt: Date;
}

export const SUPPLIER_STORE =
  "idTemp, id, businessId, name, taxId, syncStatus, isActive";
