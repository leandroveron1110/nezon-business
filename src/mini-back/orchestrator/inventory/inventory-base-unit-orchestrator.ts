import {
  BaseUnitServicePublic,
  CreateBaseUnitInput,
  IBaseUnitPublicService,
  UpdateBaseUnitInput,
} from "@/mini-back/core/inventory-core/public";
import { InventoryBaseUnitRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-base-unit.repository";

class InventoryBaseUnitOrchestrator {
  private readonly baseUnitService: IBaseUnitPublicService;

  constructor() {
    const baseUnitRepository = new InventoryBaseUnitRepository();

    this.baseUnitService = BaseUnitServicePublic({
      baseUnit: baseUnitRepository,
    });
  }

  async findByIdTemp(idTemp: string) {
    return this.baseUnitService.findByIdTemp(idTemp);
  }

  async findAll() {
    return this.baseUnitService.findAll();
  }

  async create(input: CreateBaseUnitInput) {
    return this.baseUnitService.create(input);
  }

  async update(input: UpdateBaseUnitInput) {
    return this.baseUnitService.update(input);
  }
}

export const inventoryBaseUnitOrchestrator =
  new InventoryBaseUnitOrchestrator();
