import { InventoryLocationModel } from "@/mini-back/core/inventory-core/public";
import { InventoryLocationPorts } from "@/mini-back/core/inventory-core/ports/inventory-location.ports";
import { db } from "../../db";
import { LocalInventoryLocation } from "../../shcema/inventory/inventory-location.schema";

export class InventoryLocationRepository implements InventoryLocationPorts {
  async findLocationByIdTemp(
    idTemp: string,
  ): Promise<InventoryLocationModel | null> {
    const record = await db.inventoryLocations.get(idTemp);

    return record ? (record as InventoryLocationModel) : null;
  }

  async findAllLocations(
    businessId: string,
  ): Promise<InventoryLocationModel[]> {
    const records = await db.inventoryLocations
      .where("businessId")
      .equals(businessId)
      .toArray();

    return records as InventoryLocationModel[];
  }

  async saveLocation(location: InventoryLocationModel): Promise<void> {
    await db.inventoryLocations.put(location as LocalInventoryLocation);
  }
}