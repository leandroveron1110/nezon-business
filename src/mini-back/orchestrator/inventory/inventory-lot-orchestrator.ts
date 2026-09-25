import {
  CreateLotInput,
  ILotPublicService,
  LotServicePublic,
  UpdateLotInput,
} from "@/mini-back/core/inventory-core/public";
import { InventoryLotRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-lot.repository";
import { InventoryProductRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-product.repository";

class InventoryLotOrchestrator {
  private readonly lotService: ILotPublicService;

  constructor() {
    const lotRepository = new InventoryLotRepository();

    const productRepository = new InventoryProductRepository();

    this.lotService = LotServicePublic({
      lot: lotRepository,
      product: productRepository,
    });
  }

  async findByBusinessId(businessId: string) {
    return this.lotService.findByBusinessId(businessId);
  }

  async findByIdTemp(idTemp: string) {
    return this.lotService.findByIdTemp(idTemp);
  }

  async findByProduct(inventoryProductIdTemp: string) {
    return this.lotService.findByProduct(inventoryProductIdTemp);
  }

  async findByNumber(inventoryProductIdTemp: string, lotNumber: string) {
    return this.lotService.findByNumber(inventoryProductIdTemp, lotNumber);
  }

  async create(input: CreateLotInput) {
    return this.lotService.create(input);
  }

  async update(input: UpdateLotInput) {
    return this.lotService.update(input);
  }
}

export const inventoryLotOrchestrator = new InventoryLotOrchestrator();
