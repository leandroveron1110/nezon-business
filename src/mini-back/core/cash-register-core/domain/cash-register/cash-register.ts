export interface CashRegister {
  // UUID definitivo asignado por el servidor.
  id?: string | null;
  // UUID local generado inmediatamente.
  idTemp: string;
  businessId: string;

  name: string; // Ej: "Caja Mostrador 1", "Barra Principal", "Delivery 01"

  // Cuenta de tesorería asociada por defecto para cobros en efectivo
  defaultTreasuryAccountId: string; // FK a LocalTreasuryAccount (tipo CASH)


  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
