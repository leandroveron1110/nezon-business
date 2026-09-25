import { InventoryLotModel, InventoryLotPorts } from "@/mini-back/core/inventory-core/public";
import { db } from "../../db";
import { LocalInventoryLot } from "../../shcema/inventory/inventory-lot.schema";

export class InventoryLotRepository implements InventoryLotPorts {

  async findByBusinessId(businessId: string): Promise<InventoryLotModel[]> {
    const records = await db.inventoryLots
      .where("businessId")
      .equals(businessId)
      .toArray();

    return records as InventoryLotModel[];
  }

  async findLotByIdTemp(idTemp: string): Promise<InventoryLotModel | null> {
    const record = await db.inventoryLots.get(idTemp);
    return record ? (record as InventoryLotModel) : null;
  }

  async findLotByNumber(
    inventoryProductIdTemp: string,
    lotNumber: string,
  ): Promise<InventoryLotModel | null> {
    const record = await db.inventoryLots
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp)
      .filter((lot) => lot.lotNumber === lotNumber.trim())
      .first();

    return record ? (record as InventoryLotModel) : null;
  }

  async findActiveLotsByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryLotModel[]> {
    const records = await db.inventoryLots
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp)
      .toArray();

    return records as InventoryLotModel[];
  }

  async saveLot(lot: InventoryLotModel): Promise<void> {
    await db.inventoryLots.put(lot as LocalInventoryLot);
  }
}