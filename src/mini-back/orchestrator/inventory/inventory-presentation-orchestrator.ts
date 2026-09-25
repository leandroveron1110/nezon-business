import {
    CreatePresentationInput,
  IPresentationPublicService,
  PresentationServicePublic,
  UpdatePresentationInput,
} from "@/mini-back/core/inventory-core/public";
import { InventoryPresentationRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-presentation.repository";
import { InventoryProductRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-product.repository";

class InventoryPresentationOrchestrator {
  private readonly presentationService: IPresentationPublicService;

  constructor() {
    const presentationRepository = new InventoryPresentationRepository();

    const productRepository = new InventoryProductRepository();

    this.presentationService = PresentationServicePublic({
      presentation: presentationRepository,
      product: productRepository,
    });
  }

  async findByIdTemp(idTemp: string) {
    return this.presentationService.findByIdTemp(idTemp);
  }

  async findByProduct(inventoryProductIdTemp: string) {
    return this.presentationService.findByProduct(inventoryProductIdTemp);
  }

  async create(input: CreatePresentationInput) {
    return this.presentationService.create(input);
  }

  async update(input: UpdatePresentationInput) {
    return this.presentationService.update(input);
  }
}

export const inventoryPresentationOrchestrator =
  new InventoryPresentationOrchestrator();
