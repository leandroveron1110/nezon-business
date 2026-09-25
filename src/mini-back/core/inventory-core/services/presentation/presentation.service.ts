import { InventoryPresentationModel } from "../../domain/models/inventory-presentation.model";

import { CreatePresentationInput } from "../../inputs/presentation/create-presentation.input";
import { UpdatePresentationInput } from "../../inputs/presentation/update-presentation.input";
import { IPresentationPublicService } from "../../public/presentation-service.interface";
import { InventoryPresentationPorts } from "../../ports/inventory-presentation.ports";
import { InventoryProductPorts } from "../../ports/inventory-product.ports";

export class PresentationService implements IPresentationPublicService {
  constructor(
    private readonly ports: InventoryPresentationPorts,
    private readonly portProduc: InventoryProductPorts,
  ) {}
  findByIdTemp(idTemp: string): Promise<InventoryPresentationModel | null> {
    return this.ports.findPresentationByIdTemp(idTemp);
  }
  findByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryPresentationModel[]> {
    return this.ports.findPresentationsByProduct(inventoryProductIdTemp);
  }

  async create(
    input: CreatePresentationInput,
  ): Promise<InventoryPresentationModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.idTemp) {
      throw new Error("idTemp es obligatorio.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("El nombre de la presentación es obligatorio.");
    }

    if (input.conversionFactor <= 0) {
      throw new Error("El factor de conversión debe ser mayor que cero.");
    }

    const product = await this.portProduc.findProductByIdTemp(
      input.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    const now = new Date().toISOString();

    const presentation: InventoryPresentationModel = {
      idTemp: input.idTemp,
      inventoryProductIdTemp: input.inventoryProductIdTemp,
      name,
      conversionFactor: input.conversionFactor,
      barcode: input.barcode ?? null,
      isDefault: input.isDefault,
      createdAt: now,
      updatedAt: now,
    };

    await this.ports.savePresentation(presentation);

    return presentation;
  }

  async update(
    input: UpdatePresentationInput,
  ): Promise<InventoryPresentationModel> {
    const presentation = await this.ports.findPresentationByIdTemp(
      input.idTemp,
    );

    if (!presentation) {
      throw new Error("Presentación no encontrada.");
    }

    const product = await this.portProduc.findProductByIdTemp(
      presentation.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("La presentación no pertenece al negocio.");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("El nombre de la presentación no puede estar vacío.");
    }

    if (input.conversionFactor !== undefined && input.conversionFactor <= 0) {
      throw new Error("El factor de conversión debe ser mayor que cero.");
    }

    const updatedPresentation: InventoryPresentationModel = {
      ...presentation,

      name: input.name !== undefined ? input.name.trim() : presentation.name,

      conversionFactor:
        input.conversionFactor !== undefined
          ? input.conversionFactor
          : presentation.conversionFactor,

      barcode:
        input.barcode !== undefined ? input.barcode : presentation.barcode,

      updatedAt: new Date().toISOString(),
    };

    await this.ports.savePresentation(updatedPresentation);

    return updatedPresentation;
  }
}
