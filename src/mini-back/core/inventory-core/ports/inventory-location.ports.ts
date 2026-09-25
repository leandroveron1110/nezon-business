// src/cores/inventory-core/ports/inventory-location.ports.ts

import { InventoryLocationModel } from "../domain/models/inventory-location.model";

export interface InventoryLocationPorts {
  findLocationByIdTemp(idTemp: string): Promise<InventoryLocationModel | null>;

  findAllLocations(businessId: string): Promise<InventoryLocationModel[]>;

  saveLocation(location: InventoryLocationModel): Promise<void>;
}
