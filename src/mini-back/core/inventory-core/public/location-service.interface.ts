// src/cores/inventory-core/public/location-service.interface.ts

import { InventoryLocationModel } from "../domain/models/inventory-location.model";
import { ActivateLocationInput } from "../inputs/location/activate-location.input";
import { CreateLocationInput } from "../inputs/location/create-location.input";
import { DeactivateLocationInput } from "../inputs/location/deactivate-location.input";
import { UpdateLocationInput } from "../inputs/location/update-location.input";


export interface ILocationPublicService {
  create(input: CreateLocationInput): Promise<InventoryLocationModel>;

  update(input: UpdateLocationInput): Promise<InventoryLocationModel>;

  findByIdTemp(
    idTemp: string,
  ): Promise<InventoryLocationModel | null>;

  findAll(
    businessId: string,
  ): Promise<InventoryLocationModel[]>;

  activate(input: ActivateLocationInput): Promise<InventoryLocationModel>;

  deactivate(input: DeactivateLocationInput): Promise<InventoryLocationModel>;
}