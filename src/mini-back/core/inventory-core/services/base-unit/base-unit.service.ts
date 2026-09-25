import { InventoryBaseUnitModel } from "../../domain/models/inventory-base-unit.model";
import { CreateBaseUnitInput } from "../../inputs/base-unit/create-base-unit.input";
import { UpdateBaseUnitInput } from "../../inputs/base-unit/update-base-unit.input";
import { InventoryBaseUnitPorts } from "../../ports/inventory-base-unit.ports";
import { IBaseUnitPublicService } from "../../public/base-unit-service.interface";

export class BaseUnitService implements IBaseUnitPublicService {
  constructor(private readonly ports: InventoryBaseUnitPorts) {}
  findByIdTemp(idTemp: string): Promise<InventoryBaseUnitModel | null> {
    return this.ports.findBaseUnitByIdTemp(idTemp);
  }
  findAll(): Promise<InventoryBaseUnitModel[]> {
    return this.ports.findAllBaseUnits();
  }

  async create(input: CreateBaseUnitInput): Promise<InventoryBaseUnitModel> {
    if (!input.idTemp) {
      throw new Error("idTemp es obligatorio.");
    }

    const code = input.code.trim();

    if (!code) {
      throw new Error("El código es obligatorio.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("El nombre es obligatorio.");
    }

    const now = new Date().toISOString();

    const baseUnit: InventoryBaseUnitModel = {
      idTemp: input.idTemp,
      code,
      name,
      createdAt: now,
      updatedAt: now,
    };

    await this.ports.saveBaseUnit(baseUnit);

    return baseUnit;
  }

  async update(input: UpdateBaseUnitInput): Promise<InventoryBaseUnitModel> {
    const baseUnit = await this.ports.findBaseUnitByIdTemp(input.idTemp);

    if (!baseUnit) {
      throw new Error("Unidad base no encontrada.");
    }

    if (input.code !== undefined && !input.code.trim()) {
      throw new Error("El código no puede estar vacío.");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("El nombre no puede estar vacío.");
    }

    const updatedBaseUnit: InventoryBaseUnitModel = {
      ...baseUnit,

      code: input.code !== undefined ? input.code.trim() : baseUnit.code,

      name: input.name !== undefined ? input.name.trim() : baseUnit.name,

      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveBaseUnit(updatedBaseUnit);

    return updatedBaseUnit;
  }
}
