import { InventoryStockModel } from "@/mini-back/core/inventory-core/public";
import { InventoryStockPorts } from "@/mini-back/core/inventory-core/ports/inventory-stock.ports";
import { db } from "../../db";
import { LocalInventoryStock } from "../../shcema/inventory/inventory-stock.schema";

export class InventoryStockRepository implements InventoryStockPorts {

  async findByBusinessId(businessId: string): Promise<InventoryStockModel[]> {
    const records = await db.inventoryStocks
      .where("businessId")
      .equals(businessId)
      .toArray();

    return records as InventoryStockModel[];
  }

  async findByProduct(
    inventoryProductIdTemp: string,
    locationIdTemp?: string,
  ): Promise<InventoryStockModel[]> {
    // Caso 1: Búsqueda específica por Producto + Ubicación
    if (locationIdTemp) {
      const records = await db.inventoryStocks
        .where("[inventoryProductIdTemp+locationIdTemp]")
        .equals([inventoryProductIdTemp, locationIdTemp])
        .toArray();

      return records as InventoryStockModel[];
    }

    // Caso 2: Búsqueda global del Producto en todas las ubicaciones
    const records = await db.inventoryStocks
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp)
      .toArray();

    return records as InventoryStockModel[];
  }

  async findStock(params: {
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
  }): Promise<InventoryStockModel | null> {
    const { inventoryProductIdTemp, locationIdTemp, lotIdTemp = null } = params;

    const record = await db.inventoryStocks
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp)
      .filter(
        (stock) =>
          stock.locationIdTemp === locationIdTemp &&
          (stock.lotIdTemp ?? null) === lotIdTemp,
      )
      .first();

    return record ? (record as InventoryStockModel) : null;
  }

  async findActiveStocksByProduct(
    inventoryProductIdTemp: string,
    locationIdTemp?: string,
  ): Promise<InventoryStockModel[]> {
    const query = db.inventoryStocks
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp);

    const records = await query
      .filter(
        (stock) =>
          (locationIdTemp === undefined ||
            stock.locationIdTemp === locationIdTemp) &&
          stock.quantityBase > 0,
      )
      .toArray();

    return records as InventoryStockModel[];
  }

  async saveStock(stock: InventoryStockModel): Promise<void> {
    await db.inventoryStocks.put(stock as LocalInventoryStock);
  }
}
