// src/cores/inventory-core/public/lot-service.interface.ts

import { InventoryLotModel } from "../domain/models/inventory-lot.model";

import { CreateLotInput } from "../inputs/lot/create-lot.input";
import { UpdateLotInput } from "../inputs/lot/update-lot.input";

export interface ILotPublicService {
  findByBusinessId(businessId: string): Promise<InventoryLotModel[]>

  create(input: CreateLotInput): Promise<InventoryLotModel>;

  update(input: UpdateLotInput): Promise<InventoryLotModel>;

  findByIdTemp(idTemp: string): Promise<InventoryLotModel | null>;

  findByProduct(inventoryProductIdTemp: string): Promise<InventoryLotModel[]>;

  findByNumber(
    inventoryProductIdTemp: string,
    lotNumber: string,
  ): Promise<InventoryLotModel | null>;
}
