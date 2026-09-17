import { EmployeePaymentType } from "@/mini-back/shared/enums/employee-payment-type.enum";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";

export interface LocalBusinessEmployee {

  // UUID local generado inmediatamente.
  idTemp: string;

  // UUID definitivo asignado por el servidor.
  id?: string | null;

  businessId: string;

  // Usuario global de Hunay, si existe.
  userId?: string | null;

  firstName: string;

  lastName: string;

  phone?: string | null;

  // Puesto dentro del negocio.
  positionId?: string | null;

  // Estado del empleado.
  isActive: boolean;

  // Modalidad de pago.
  paymentType: EmployeePaymentType;

  // Valor de pago según la modalidad.
  paymentRate: number;

  // Acceso opcional a Hunay-Business.
  username?: string | null;

  // Rol de acceso al sistema.
  roleId?: string | null;

  syncStatus: SyncStatus;

  syncPriority: "HIGH";

  createdAt: Date;

  updatedAt: Date;

}

// ÍNDICES DEXIE

export const BUSINESS_EMPLOYEE_STORE =
  "idTemp, id, businessId, userId, positionId, roleId, username, [businessId+idTemp], [businessId+isActive], isActive";