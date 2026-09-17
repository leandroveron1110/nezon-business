export enum EmployeePaymentType {
  DAILY = "DAILY",
  HOURLY = "HOURLY",
  MONTHLY = "MONTHLY",
}

export interface Employee {
  id: string;
  businessId: string;

  userId?: string | null;

  firstName: string;
  lastName: string;
  phone?: string | null;

  positionId?: string | null;

  isActive: boolean;

  paymentType: EmployeePaymentType;
  paymentRate: number;
}
