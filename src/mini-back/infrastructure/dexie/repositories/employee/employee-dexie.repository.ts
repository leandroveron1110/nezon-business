import { EmployeePorts } from "@/mini-back/core/employee-core/ports/employee.ports";
import { Employee } from "@/mini-back/core/employee-core/domain/employee";
import { CreateEmployeeInput } from "@/mini-back/core/employee-core/inputs/create-employee.input";
import { UpdateEmployeeInput } from "@/mini-back/core/employee-core/inputs/update-employee.input";
import { SyncStatus } from "@/mini-back/shared/types/sync-status.type";
import { db } from "../../db";
import { LocalBusinessEmployee } from "../../shcema/business-employee.schema";

export class EmployeeDexieRepository implements EmployeePorts {
  async findEmployeeById(employeeId: string): Promise<Employee | null> {
    // Busca por idTemp o por id asignado por el servidor
    const record = await db.businessEmployees.get(employeeId);

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findEmployeesByBusinessId(businessId: string): Promise<Employee[]> {
    const records = await db.businessEmployees
      .where("businessId")
      .equals(businessId)
      .toArray();

    return records.map(this.mapToDomain);
  }

  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    const now = new Date();
    const idTemp = crypto.randomUUID();

    const newRecord: LocalBusinessEmployee = {
      idTemp,
      id: null,
      businessId: input.businessId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      positionId: input.positionId ?? null,
      paymentType: input.paymentType,
      paymentRate: input.paymentRate,
      isActive: true,
      syncStatus: "PENDING" as SyncStatus,
      syncPriority: "HIGH",
      createdAt: now,
      updatedAt: now,
    };

    await db.businessEmployees.put(newRecord);

    return this.mapToDomain(newRecord);
  }

  async updateEmployee(input: UpdateEmployeeInput): Promise<Employee> {
    const existing = await db.businessEmployees.get(input.employeeId);

    if (!existing) {
      throw new Error(
        `Infraestructura: Registro de empleado ${input.employeeId} no encontrado localmente.`,
      );
    }

    const updatedRecord: LocalBusinessEmployee = {
      ...existing,
      firstName: input.firstName ?? existing.firstName,
      lastName: input.lastName ?? existing.lastName,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      positionId:
        input.positionId !== undefined ? input.positionId : existing.positionId,
      isActive:
        input.isActive !== undefined ? input.isActive : existing.isActive,
      paymentType: input.paymentType ?? existing.paymentType,
      paymentRate: input.paymentRate ?? existing.paymentRate,
      syncStatus: "PENDING" as SyncStatus,
      updatedAt: new Date(),
    };

    await db.businessEmployees.put(updatedRecord);

    return this.mapToDomain(updatedRecord);
  }

  async saveEmployee(employee: Employee): Promise<void> {
    const existing = await db.businessEmployees.get(employee.id);

    const recordToSave: LocalBusinessEmployee = {
      idTemp: existing?.idTemp ?? employee.id,
      id: existing?.id ?? null,
      businessId: employee.businessId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone ?? null,
      positionId: employee.positionId ?? null,
      isActive: employee.isActive,
      paymentType: employee.paymentType,
      paymentRate: employee.paymentRate,
      syncStatus: "PENDING" as SyncStatus,
      syncPriority: "HIGH",
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    await db.businessEmployees.put(recordToSave);
  }

  // Mapper privado para transformar el registro local de IndexedDB a la entidad del Core
  private mapToDomain(record: LocalBusinessEmployee): Employee {
    return {
      id: record.idTemp, // Usamos la clave local idTemp como identificador operativo en el Core
      businessId: record.businessId,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone ?? undefined,
      positionId: record.positionId ?? undefined,
      isActive: record.isActive,
      paymentType: record.paymentType,
      paymentRate: record.paymentRate,
    };
  }
}
