// src/cores/inventory-core/ports/inventory-physical-stock.ports.ts

import { InventoryPhysicalStockModel } from "../domain/models/inventory-physical-stock.model";

export interface InventoryPhysicalStockPorts {
  findPhysicalStockByStock(
    stockIdTemp: string,
  ): Promise<InventoryPhysicalStockModel[]>;

  savePhysicalStock(physicalStock: InventoryPhysicalStockModel): Promise<void>;
}
