// src/cores/inventory-core/ports/inventory-base-unit.ports.ts

import { InventoryBaseUnitModel } from "../domain/models/inventory-base-unit.model";

export interface InventoryBaseUnitPorts {
  findBaseUnitByIdTemp(idTemp: string): Promise<InventoryBaseUnitModel | null>;

  findAllBaseUnits(): Promise<InventoryBaseUnitModel[]>;

  saveBaseUnit(baseUnit: InventoryBaseUnitModel): Promise<void>;
}
