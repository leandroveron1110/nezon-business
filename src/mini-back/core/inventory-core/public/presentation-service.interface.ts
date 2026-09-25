// src/cores/inventory-core/public/presentation-service.interface.ts

import { InventoryPresentationModel } from "../domain/models/inventory-presentation.model";

import { CreatePresentationInput } from "../inputs/presentation/create-presentation.input";
import { UpdatePresentationInput } from "../inputs/presentation/update-presentation.input";

export interface IPresentationPublicService {
  create(input: CreatePresentationInput): Promise<InventoryPresentationModel>;

  update(input: UpdatePresentationInput): Promise<InventoryPresentationModel>;

  findByIdTemp(idTemp: string): Promise<InventoryPresentationModel | null>;

  findByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryPresentationModel[]>;
}
