import { InventoryBaseUnitModel } from "@/mini-back/core/inventory-core/public";
import { db } from "../../db";
import { LocalInventoryBaseUnit } from "../../shcema/inventory/inventory-base-unit.schema";
import { InventoryBaseUnitPorts } from "@/mini-back/core/inventory-core/ports/inventory-base-unit.ports";

export class InventoryBaseUnitRepository implements InventoryBaseUnitPorts {
  async findBaseUnitByIdTemp(
    idTemp: string,
  ): Promise<InventoryBaseUnitModel | null> {
    const record = await db.inventoryBaseUnits.get(idTemp);

    return record ? (record as InventoryBaseUnitModel) : null;
  }

  async findAllBaseUnits(): Promise<InventoryBaseUnitModel[]> {
    const records = await db.inventoryBaseUnits.toArray();

    return records as InventoryBaseUnitModel[];
  }

  async saveBaseUnit(baseUnit: InventoryBaseUnitModel): Promise<void> {
    await db.inventoryBaseUnits.put(baseUnit as LocalInventoryBaseUnit);
  }
}