import { InventoryProductModel } from "../../domain/models/inventory-product.model";
import { ActivateProductInput } from "../../inputs/product/activate-product.input";
import { CreateProductInput } from "../../inputs/product/create-product.input";
import { DeactivateProductInput } from "../../inputs/product/deactivate-product.input";
import { UpdateProductInput } from "../../inputs/product/update-product.input";
import { InventoryProductPorts } from "../../ports/inventory-product.ports";
import { IProductPublicService } from "../../public/product-service.interface";

export class ProductService implements IProductPublicService {
  constructor(private readonly ports: InventoryProductPorts) {}
  findByIdTemp(idTemp: string): Promise<InventoryProductModel | null> {
    return this.ports.findProductByIdTemp(idTemp);
  }
  findByBusinessId(businessId: string): Promise<InventoryProductModel[]> {
    return this.ports.findByBusinessId(businessId);
  }

  async create(input: CreateProductInput): Promise<InventoryProductModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.idTemp) {
      throw new Error("idTemp es obligatorio.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("El nombre del producto es obligatorio.");
    }

    if (input.code) {
      const existingProduct = await this.ports.findProductByCode(
        input.businessId,
        input.code,
      );

      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código "${input.code}".`);
      }
    }

    const now = new Date().toISOString();

    const product: InventoryProductModel = {
      idTemp: input.idTemp,
      businessId: input.businessId,
      code: input.code ?? null,
      name,
      description: input.description ?? null,
      baseUnitIdTemp: input.baseUnitIdTemp,
      minStock: input.minStock ?? null,
      maxStock: input.maxStock ?? null,
      trackLots: input.trackLots,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.ports.saveProduct(product);

    return product;
  }

  async update(input: UpdateProductInput): Promise<InventoryProductModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.idTemp) {
      throw new Error("idTemp es obligatorio.");
    }

    const product = await this.ports.findProductByIdTemp(input.idTemp);

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("El nombre del producto no puede estar vacío.");
    }

    if (input.code !== undefined && input.code !== product.code) {
      if (input.code) {
        const existingProduct = await this.ports.findProductByCode(
          input.businessId,
          input.code,
        );

        if (existingProduct && existingProduct.idTemp !== product.idTemp) {
          throw new Error(
            `Ya existe un producto con el código "${input.code}".`,
          );
        }
      }
    }

    const updatedProduct: InventoryProductModel = {
      ...product,

      name: input.name !== undefined ? input.name.trim() : product.name,

      code: input.code !== undefined ? input.code : product.code,

      description:
        input.description !== undefined
          ? input.description
          : product.description,

      baseUnitIdTemp:
        input.baseUnitIdTemp !== undefined
          ? input.baseUnitIdTemp
          : product.baseUnitIdTemp,

      minStock:
        input.minStock !== undefined ? input.minStock : product.minStock,

      maxStock:
        input.maxStock !== undefined ? input.maxStock : product.maxStock,

      trackLots:
        input.trackLots !== undefined ? input.trackLots : product.trackLots,

      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveProduct(updatedProduct);

    return updatedProduct;
  }

  async activate(input: ActivateProductInput): Promise<InventoryProductModel> {
    const product = await this.ports.findProductByIdTemp(input.idTemp);

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    if (product.isActive) {
      return product;
    }

    const updatedProduct: InventoryProductModel = {
      ...product,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveProduct(updatedProduct);

    return updatedProduct;
  }

  async deactivate(
    input: DeactivateProductInput,
  ): Promise<InventoryProductModel> {
    const product = await this.ports.findProductByIdTemp(input.idTemp);

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    if (!product.isActive) {
      return product;
    }

    const updatedProduct: InventoryProductModel = {
      ...product,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveProduct(updatedProduct);

    return updatedProduct;
  }
}
