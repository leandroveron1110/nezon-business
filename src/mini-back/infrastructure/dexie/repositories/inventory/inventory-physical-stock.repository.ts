import { InventoryPhysicalStockModel } from "@/mini-back/core/inventory-core/public";
import { InventoryPhysicalStockPorts } from "@/mini-back/core/inventory-core/ports/inventory-physical-stock.ports";
import { db } from "../../db";
import { LocalInventoryPhysicalStock } from "../../shcema/inventory/inventory-physical-stock.schema";

export class InventoryPhysicalStockRepository implements InventoryPhysicalStockPorts {
  async findPhysicalStockByStock(
    stockIdTemp: string,
  ): Promise<InventoryPhysicalStockModel[]> {
    const records = await db.inventoryPhysicalStocks
      .where("stockIdTemp")
      .equals(stockIdTemp)
      .toArray();

    return records as InventoryPhysicalStockModel[];
  }

  async savePhysicalStock(
    physicalStock: InventoryPhysicalStockModel,
  ): Promise<void> {
    await db.inventoryPhysicalStocks.put(
      physicalStock as LocalInventoryPhysicalStock,
    );
  }
}
