import {
  AdjustStockInput,
  ConsumeStockInput,
  IStockPublicService,
  ReceiveStockInput,
  StockServicePublic,
  TransferStockInput,
} from "@/mini-back/core/inventory-core/public";
import { InventoryLocationRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-location.repository";
import { InventoryLotRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-lot.repository";
import { InventoryMovementRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-movement.repository";
import { InventoryPresentationRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-presentation.repository";
import { InventoryProductRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-product.repository";
import { InventoryStockRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-stock.repository";
import { InventoryTransactionRepository } from "@/mini-back/infrastructure/dexie/repositories/inventory/inventory-transaction.repository";

class InventoryStockOrchestrator {
  private readonly stockService: IStockPublicService;

  constructor() {
    const stockRepository = new InventoryStockRepository();

    const productRepository = new InventoryProductRepository();

    const lotRepository = new InventoryLotRepository();

    const locationRepository = new InventoryLocationRepository();

    const movementRepository = new InventoryMovementRepository();

    const transactionRepository = new InventoryTransactionRepository();

    const presentationRepository = new InventoryPresentationRepository();

    this.stockService = StockServicePublic({
      stock: stockRepository,
      product: productRepository,
      lot: lotRepository,
      location: locationRepository,
      movement: movementRepository,
      transaction: transactionRepository,
      presentation: presentationRepository,
    });
  }

  async findByBusinessId(businessId: string) {
    return this.stockService.findByBusinessId(businessId);
  }

  async findStock(params: {
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
  }) {
    return this.stockService.findStock(params);
  }

  async findByProduct(inventoryProductIdTemp: string, locationIdTemp?: string) {
    return this.stockService.findByProduct(
      inventoryProductIdTemp,
      locationIdTemp,
    );
  }

  async receive(input: ReceiveStockInput) {
    return this.stockService.receive(input);
  }

  async consume(input: ConsumeStockInput) {
    return this.stockService.consume(input);
  }

  async adjust(input: AdjustStockInput) {
    return this.stockService.adjust(input);
  }

  async transfer(input: TransferStockInput) {
    return this.stockService.transfer(input);
  }
}

export const inventoryStockOrchestrator = new InventoryStockOrchestrator();
