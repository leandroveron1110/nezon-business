// src/cores/inventory-core/ports/inventory-presentation.ports.ts

import { InventoryPresentationModel } from "../domain/models/inventory-presentation.model";

export interface InventoryPresentationPorts {
  findPresentationByIdTemp(
    idTemp: string,
  ): Promise<InventoryPresentationModel | null>;

  findPresentationsByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryPresentationModel[]>;

  savePresentation(presentation: InventoryPresentationModel): Promise<void>;
}
