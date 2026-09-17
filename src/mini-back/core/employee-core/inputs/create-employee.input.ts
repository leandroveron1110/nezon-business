import { EmployeePaymentType } from "../domain/employee";

export interface CreateEmployeeInput {
  businessId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  positionId?: string | null;
  paymentType: EmployeePaymentType;
  paymentRate: number;
}