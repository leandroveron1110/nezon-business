// src/cores/inventory-core/ports/inventory-lot.ports.ts

import { InventoryLotModel } from "../domain/models/inventory-lot.model";

export interface InventoryLotPorts {
  findByBusinessId(businessId: string): Promise<InventoryLotModel[]>
  
  findLotByIdTemp(idTemp: string): Promise<InventoryLotModel | null>;

  findLotByNumber(
    inventoryProductIdTemp: string,
    lotNumber: string,
  ): Promise<InventoryLotModel | null>;

  findActiveLotsByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryLotModel[]>;

  saveLot(lot: InventoryLotModel): Promise<void>;
}
