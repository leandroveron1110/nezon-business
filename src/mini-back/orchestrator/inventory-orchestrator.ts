import {
  IInventoryPublicServices,
  InventoryServicesPublic,
  ReceiveStockInput,
} from "../core/inventory-core/public";
import { InventoryRepository } from "../infrastructure/dexie/repositories/inventory/inventory.repository";
import { businessCapabilities } from "../shared/business-capabilities/business-capabilities";

class InventoryOrchestrator {
  private readonly inventory: IInventoryPublicServices;

  constructor() {
    const repository = new InventoryRepository();

    this.inventory = InventoryServicesPublic({
      inventory: repository,
    });
  }

  async receiveStock(input: ReceiveStockInput) {
    if (!businessCapabilities.canUse(input.businessId, "INVENTORY")) {
      throw new Error("Inventory is not enabled for this business");
    }

    return this.inventory.stock.receive(input);
  }
}

export const inventoryOrchestrator = new InventoryOrchestrator();
