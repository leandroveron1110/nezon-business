// src/cores/inventory-core/ports/inventory-stock.ports.ts

import { InventoryStockModel } from "../domain/models/inventory-stock.model";

export interface InventoryStockPorts {
  findByBusinessId(businessId: string): Promise<InventoryStockModel[]>
  findByProduct(
    inventoryProductIdTemp: string,
    locationIdTemp?: string,
  ): Promise<InventoryStockModel[]>;

  findStock(params: {
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
  }): Promise<InventoryStockModel | null>;

  findActiveStocksByProduct(
    inventoryProductIdTemp: string,
    locationIdTemp?: string,
  ): Promise<InventoryStockModel[]>;

  saveStock(stock: InventoryStockModel): Promise<void>;
}
