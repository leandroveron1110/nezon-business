// src/cores/inventory-core/public/product-service.interface.ts

import { InventoryProductModel } from "../domain/models/inventory-product.model";
import { ActivateProductInput } from "../inputs/product/activate-product.input";

import { CreateProductInput } from "../inputs/product/create-product.input";
import { DeactivateProductInput } from "../inputs/product/deactivate-product.input";
import { UpdateProductInput } from "../inputs/product/update-product.input";

export interface IProductPublicService {
  create(input: CreateProductInput): Promise<InventoryProductModel>;

  update(input: UpdateProductInput): Promise<InventoryProductModel>;

  findByIdTemp(idTemp: string): Promise<InventoryProductModel | null>;

  findByBusinessId(businessId: string): Promise<InventoryProductModel[]>;

  activate(input: ActivateProductInput): Promise<InventoryProductModel>;

  deactivate(input: DeactivateProductInput): Promise<InventoryProductModel>;
}
