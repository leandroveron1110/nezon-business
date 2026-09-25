// src/cores/inventory-core/ports/inventory-movement.ports.ts

import { InventoryMovementModel } from "../domain/models/inventory-movement.model";

export interface InventoryMovementPorts {
  saveMovement(movement: InventoryMovementModel): Promise<void>;

  findMovementsByProduct(
    inventoryProductIdTemp: string,
    limit?: number,
  ): Promise<InventoryMovementModel[]>;
}
