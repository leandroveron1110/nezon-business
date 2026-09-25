// src/cores/inventory-core/ports/inventory-product.ports.ts

import { InventoryProductModel } from "../domain/models/inventory-product.model";

export interface InventoryProductPorts {
  findProductByIdTemp(idTemp: string): Promise<InventoryProductModel | null>;

  findProductByCode(
    businessId: string,
    code: string,
  ): Promise<InventoryProductModel | null>;

  findAllProducts(businessId: string): Promise<InventoryProductModel[]>;

  findByBusinessId(businessId: string): Promise<InventoryProductModel[]>

  saveProduct(product: InventoryProductModel): Promise<void>;
}
