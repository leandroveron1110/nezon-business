import { EmployeePaymentType } from "../domain/employee";

export interface UpdateEmployeeInput {
  employeeId: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  positionId?: string | null;
  paymentType?: EmployeePaymentType;
  paymentRate?: number;
  isActive?: boolean
}