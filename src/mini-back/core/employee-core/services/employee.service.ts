import { Employee } from "../domain/employee";
import { CreateEmployeeInput } from "../inputs/create-employee.input";
import { UpdateEmployeeInput } from "../inputs/update-employee.input";
import { EmployeePorts } from "../ports/employee.ports";
import { IEmployeeService } from "../public/employee-service.interface";

export class EmployeeCoreService implements IEmployeeService {
  constructor(private readonly ports: EmployeePorts) {}

  async create(input: CreateEmployeeInput): Promise<Employee> {
    return this.ports.createEmployee(input);
  }

  async update(input: UpdateEmployeeInput): Promise<Employee> {
    await this.mustExist(input.employeeId);
    return this.ports.updateEmployee(input);
  }

  async activate(employeeId: string): Promise<Employee> {
    const employee = await this.mustExist(employeeId);

    if (employee.isActive) {
      throw new Error("Invariante Rota: El empleado ya se encuentra activo.");
    }

    return this.ports.updateEmployee({
      employeeId,
      isActive: true,
    });
  }

  async deactivate(employeeId: string): Promise<Employee> {
    const employee = await this.mustExist(employeeId);

    if (!employee.isActive) {
      throw new Error("Invariante Rota: El empleado ya se encuentra inactivo.");
    }

    return this.ports.updateEmployee({
      employeeId,
      isActive: false,
    });
  }

  async findById(employeeId: string): Promise<Employee | null> {
    return this.ports.findEmployeeById(employeeId);
  }

  async findByBusinessId(businessId: string): Promise<Employee[]> {
    return this.ports.findEmployeesByBusinessId(businessId);
  }

  private async mustExist(employeeId: string): Promise<Employee> {
    const employee = await this.ports.findEmployeeById(employeeId);
    if (!employee) {
      throw new Error(
        `Invariante Rota: Empleado con ID ${employeeId} no existe.`,
      );
    }
    return employee;
  }
}
