import { InventoryLotModel } from "../../domain/models/inventory-lot.model";
import { CreateLotInput } from "../../inputs/lot/create-lot.input";
import { UpdateLotInput } from "../../inputs/lot/update-lot.input";
import { InventoryLotPorts } from "../../ports/inventory-lot.ports";
import { InventoryProductPorts } from "../../ports/inventory-product.ports";
import { ILotPublicService } from "../../public/lot-service.interface";

export class LotService implements ILotPublicService {
  constructor(
    private readonly ports: InventoryLotPorts,
    private readonly portProct: InventoryProductPorts,
  ) {}

  async findByBusinessId(businessId: string): Promise<InventoryLotModel[]> {
    return this.ports.findByBusinessId(businessId);
  }

  async findByIdTemp(idTemp: string): Promise<InventoryLotModel | null> {
    if (!idTemp) return null;
    return this.ports.findLotByIdTemp(idTemp);
  }

  async findByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryLotModel[]> {
    if (!inventoryProductIdTemp) return [];
    return this.ports.findActiveLotsByProduct(inventoryProductIdTemp);
  }

  async findByNumber(
    inventoryProductIdTemp: string,
    lotNumber: string,
  ): Promise<InventoryLotModel | null> {
    if (!inventoryProductIdTemp || !lotNumber) return null;
    return this.ports.findLotByNumber(inventoryProductIdTemp, lotNumber.trim());
  }

  async create(input: CreateLotInput): Promise<InventoryLotModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.idTemp) {
      throw new Error("idTemp es obligatorio.");
    }

    if (!input.inventoryProductIdTemp) {
      throw new Error("inventoryProductIdTemp es obligatorio.");
    }

    const product = await this.portProct.findProductByIdTemp(
      input.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    const lotNumber = input.lotNumber.trim();

    if (!lotNumber) {
      throw new Error("El número de lote es obligatorio.");
    }

    const existingLot = await this.ports.findLotByNumber(
      input.inventoryProductIdTemp,
      lotNumber,
    );

    if (existingLot) {
      throw new Error(`Ya existe el lote "${lotNumber}" para este producto.`);
    }

    const now = new Date().toISOString();

    const lot: InventoryLotModel = {
      idTemp: input.idTemp,
      businessId: input.businessId,
      inventoryProductIdTemp: input.inventoryProductIdTemp,
      lotNumber,
      expirationDate: input.expirationDate ?? null,
      manufactureDate: input.manufactureDate ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.ports.saveLot(lot);

    return lot;
  }

  async update(input: UpdateLotInput): Promise<InventoryLotModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    const lot = await this.ports.findLotByIdTemp(input.idTemp);

    if (!lot) {
      throw new Error("Lote no encontrado.");
    }

    const product = await this.portProct.findProductByIdTemp(
      lot.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El lote no pertenece al negocio.");
    }

    if (input.lotNumber !== undefined && !input.lotNumber.trim()) {
      throw new Error("El número de lote no puede estar vacío.");
    }

    if (
      input.lotNumber !== undefined &&
      input.lotNumber.trim() !== lot.lotNumber
    ) {
      const existingLot = await this.ports.findLotByNumber(
        lot.inventoryProductIdTemp,
        input.lotNumber.trim(),
      );

      if (existingLot && existingLot.idTemp !== lot.idTemp) {
        throw new Error(
          `Ya existe el lote "${input.lotNumber.trim()}" para este producto.`,
        );
      }
    }

    const updatedLot: InventoryLotModel = {
      ...lot,

      lotNumber:
        input.lotNumber !== undefined ? input.lotNumber.trim() : lot.lotNumber,

      expirationDate:
        input.expirationDate !== undefined
          ? input.expirationDate
          : lot.expirationDate,

      manufactureDate:
        input.manufactureDate !== undefined
          ? input.manufactureDate
          : lot.manufactureDate,

      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveLot(updatedLot);

    return updatedLot;
  }
}
