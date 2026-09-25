// src/cores/inventory-core/public/base-unit-service.interface.ts

import { InventoryBaseUnitModel } from "../domain/models/inventory-base-unit.model";
import { CreateBaseUnitInput } from "../inputs/base-unit/create-base-unit.input";
import { UpdateBaseUnitInput } from "../inputs/base-unit/update-base-unit.input";

export interface IBaseUnitPublicService {
  create(input: CreateBaseUnitInput): Promise<InventoryBaseUnitModel>;

  update(input: UpdateBaseUnitInput): Promise<InventoryBaseUnitModel>;

  findByIdTemp(idTemp: string): Promise<InventoryBaseUnitModel | null>;

  findAll(): Promise<InventoryBaseUnitModel[]>;
}
