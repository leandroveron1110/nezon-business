import {
  ActivateLocationInput,
  CreateLocationInput,
  DeactivateLocationInput,
  ILocationPublicService,
  LocationServicePublic,
  UpdateLocationInput,
} from "@/mini-back/core/inventory-core/public";
import { InventoryLocationRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-location.repository";

class InventoryLocationOrchestrator {
  private readonly locationService: ILocationPublicService;

  constructor() {
    const locationRepository = new InventoryLocationRepository();

    this.locationService = LocationServicePublic({
      location: locationRepository,
    });
  }


  async findAll(businessId: string) {
    return this.locationService.findAll(businessId);
  }

  async findByIdTemp(idTemp: string) {
    return this.locationService.findByIdTemp(idTemp);
  }

  async create(input: CreateLocationInput) {
    return this.locationService.create(input);
  }

  async update(input: UpdateLocationInput) {
    return this.locationService.update(input);
  }

  async activate(input: ActivateLocationInput) {
    return this.locationService.activate(input);
  }

  async deactivate(input: DeactivateLocationInput) {
    return this.locationService.deactivate(input);
  }
}

export const inventoryLocationOrchestrator =
  new InventoryLocationOrchestrator();
