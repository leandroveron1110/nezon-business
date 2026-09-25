import { InventoryProductModel } from "@/mini-back/core/inventory-core/public";
import { InventoryProductPorts } from "@/mini-back/core/inventory-core/ports/inventory-product.ports";
import { db } from "../../db";
import { LocalInventoryProduct } from "../../shcema/inventory/inventory-product.schema";

export class InventoryProductRepository implements InventoryProductPorts {
  async findByBusinessId(businessId: string): Promise<InventoryProductModel[]> {
    const records = await db.inventoryProducts
      .where("businessId")
      .equals(businessId)
      .toArray();

    return records as InventoryProductModel[];
  }
  async findProductByIdTemp(
    idTemp: string,
  ): Promise<InventoryProductModel | null> {
    const record = await db.inventoryProducts.get(idTemp);

    return record ? (record as InventoryProductModel) : null;
  }

  async findProductByCode(
    businessId: string,
    code: string,
  ): Promise<InventoryProductModel | null> {
    const record = await db.inventoryProducts
      .where("code")
      .equals(code)
      .filter((product) => product.businessId === businessId)
      .first();

    return record ? (record as InventoryProductModel) : null;
  }

  async findAllProducts(businessId: string): Promise<InventoryProductModel[]> {
    const records = await db.inventoryProducts
      .where("businessId")
      .equals(businessId)
      .toArray();

    return records as InventoryProductModel[];
  }

  async saveProduct(product: InventoryProductModel): Promise<void> {
    await db.inventoryProducts.put(product as LocalInventoryProduct);
  }
}
