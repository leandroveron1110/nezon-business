import {
  ActivateProductInput,
  CreateProductInput,
  DeactivateProductInput,
  IProductPublicService,
  ProductServicePublic,
  UpdateProductInput,
} from "@/mini-back/core/inventory-core/public";
import { InventoryProductRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-product.repository";

class InventoryProductOrchestrator {
  private readonly productService: IProductPublicService;

  constructor() {
    const productRepository = new InventoryProductRepository();

    this.productService = ProductServicePublic({
      product: productRepository,
    });
  }

  async findByIdTemp(idTemp: string) {
    return this.productService.findByIdTemp(idTemp);
  }

  async findByBusinessId(businessId: string) {
    return this.productService.findByBusinessId(businessId);
  }

  async create(input: CreateProductInput) {
    return this.productService.create(input);
  }

  async update(input: UpdateProductInput) {
    return this.productService.update(input);
  }

  async activate(input: ActivateProductInput) {
    return this.productService.activate(input);
  }

  async deactivate(input: DeactivateProductInput) {
    return this.productService.deactivate(input);
  }
}

export const inventoryProductOrchestrator = new InventoryProductOrchestrator();
