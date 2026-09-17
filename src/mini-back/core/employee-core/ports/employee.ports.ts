import { Employee } from "../domain/employee";
import { CreateEmployeeInput } from "../inputs/create-employee.input";
import { UpdateEmployeeInput } from "../inputs/update-employee.input";

export interface EmployeePorts {
  findEmployeeById(employeeId: string): Promise<Employee | null>;
  findEmployeesByBusinessId(businessId: string): Promise<Employee[]>;
  saveEmployee(employee: Employee): Promise<void>;
  createEmployee(input: CreateEmployeeInput): Promise<Employee>;
  updateEmployee(input: UpdateEmployeeInput): Promise<Employee>;
}