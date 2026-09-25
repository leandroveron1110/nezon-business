import { InventoryMovementModel } from "@/mini-back/core/inventory-core/public";
import { InventoryMovementPorts } from "@/mini-back/core/inventory-core/ports/inventory-movement.ports";
import { db } from "../../db";
import { LocalInventoryMovement } from "../../shcema/inventory/inventory-movement.schema";

export class InventoryMovementRepository implements InventoryMovementPorts {
  async saveMovement(movement: InventoryMovementModel): Promise<void> {
    await db.inventoryMovements.add(movement as LocalInventoryMovement);
  }

  async findMovementsByProduct(
    inventoryProductIdTemp: string,
    limit?: number,
  ): Promise<InventoryMovementModel[]> {
    let records = await db.inventoryMovements
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp)
      .reverse()
      .sortBy("createdAt");

    if (limit !== undefined) {
      records = records.slice(0, limit);
    }

    return records as InventoryMovementModel[];
  }
}
