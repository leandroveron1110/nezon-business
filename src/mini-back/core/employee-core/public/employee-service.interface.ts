import { Employee } from "../domain/employee";
import { CreateEmployeeInput } from "../inputs/create-employee.input";
import { UpdateEmployeeInput } from "../inputs/update-employee.input";

export interface IEmployeeService {
  create(input: CreateEmployeeInput): Promise<Employee>;

  update(input: UpdateEmployeeInput): Promise<Employee>;

  activate(employeeId: string): Promise<Employee>;

  deactivate(employeeId: string): Promise<Employee>;

  findById(employeeId: string): Promise<Employee | null>;

  findByBusinessId(businessId: string): Promise<Employee[]>;
}