import { InventoryMovementModel } from "../../domain/models/inventory-movement.model";
import { InventoryStockModel } from "../../domain/models/inventory-stock.model";

import { InventoryMovementReason } from "../../domain/enums/inventory-movement-reason.enum";
import { InventoryMovementType } from "../../domain/enums/inventory-movement-type.enum";
import { InventoryMovementReferenceType } from "../../domain/enums/inventory-movement-ref-type.enum";
import { StockWithdrawalStrategy } from "../../domain/enums/stock-withdrawal-strategy.enum";

import { ReceiveStockInput } from "../../inputs/stock/receive-stock.input";
import { ConsumeStockInput } from "../../inputs/stock/consume-stock.input";
import { AdjustStockInput } from "../../inputs/stock/adjust-stock.input";
import { TransferStockInput } from "../../inputs/stock/transfer-stock.input";
import { IStockPublicService } from "../../public/stock-service.interface";
import { InventoryStockPorts } from "../../ports/inventory-stock.ports";
import { InventoryProductPorts } from "../../ports/inventory-product.ports";
import { InventoryLotPorts } from "../../ports/inventory-lot.ports";
import { InventoryLocationPorts } from "../../ports/inventory-location.ports";
import { InventoryMovementPorts } from "../../ports/inventory-movement.ports";
import { InventoryTransactionPorts } from "../../ports/inventory-transaction.ports";
import { InventoryLotModel, InventoryPresentationPorts } from "../../public";

export class StockService implements IStockPublicService {
  constructor(
    private readonly ports: InventoryStockPorts,
    private readonly portProduct: InventoryProductPorts,
    private readonly portLot: InventoryLotPorts,
    private readonly portLocation: InventoryLocationPorts,
    private readonly portMovement: InventoryMovementPorts,
    private readonly portTransaction: InventoryTransactionPorts,
    private readonly portPresentation: InventoryPresentationPorts,
  ) {}

  async findByBusinessId(businessId: string): Promise<InventoryStockModel[]> {
    return this.ports.findByBusinessId(businessId);
  }

  findStock(params: {
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
  }): Promise<InventoryStockModel | null> {
    return this.ports.findStock(params);
  }
  findByProduct(
    inventoryProductIdTemp: string,
    locationIdTemp?: string,
  ): Promise<InventoryStockModel[]> {
    return this.ports.findByProduct(inventoryProductIdTemp, locationIdTemp);
  }

  // ============================================================
  // RECEIVE
  // ============================================================

  async receive(input: ReceiveStockInput): Promise<InventoryStockModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.inventoryProductIdTemp) {
      throw new Error("inventoryProductIdTemp es obligatorio.");
    }

    if (!input.locationIdTemp) {
      throw new Error("locationIdTemp es obligatorio.");
    }

    const rawQuantity =
      input.presentationIdTemp && input.presentationQuantity
        ? input.presentationQuantity
        : input.quantityBase;

    if (!rawQuantity || rawQuantity <= 0) {
      throw new Error("La cantidad recibida debe ser mayor que cero.");
    }

    const product = await this.portProduct.findProductByIdTemp(
      input.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    const location = await this.portLocation.findLocationByIdTemp(
      input.locationIdTemp,
    );

    if (!location) {
      throw new Error("Ubicación no encontrada.");
    }

    if (location.businessId !== input.businessId) {
      throw new Error("La ubicación no pertenece al negocio.");
    }

    if (!location.isActive) {
      throw new Error("No se puede recibir stock en una ubicación inactiva.");
    }

    // ============================================================
    // CÁLCULO DE CANTIDAD BASE
    // ============================================================
    let finalQuantityBase = input.quantityBase;

    if (input.presentationIdTemp && input.presentationQuantity) {
      const presentation = await this.portPresentation.findPresentationByIdTemp(
        input.presentationIdTemp,
      );

      if (!presentation) {
        throw new Error("La presentación seleccionada no existe.");
      }

      finalQuantityBase =
        input.presentationQuantity * presentation.conversionFactor;
    }

    if (finalQuantityBase <= 0) {
      throw new Error("La cantidad final calculada debe ser mayor que cero.");
    }

    // ============================================================
    // RESOLUCIÓN DE LOTE (FIND OR CREATE)
    // ============================================================
    if (product.trackLots) {
      if (!input.lotNumber) {
        throw new Error("Este producto requiere lote.");
      }
      if (!input.expirationDate) {
        throw new Error("Este producto requiere fecha de vencimiento.");
      }
    }

    let lotIdTemp: string | null = null;
    let lotToSave: InventoryLotModel | null = null;

    if (input.lotNumber) {
      const existingLot = await this.portLot.findLotByNumber(
        product.idTemp,
        input.lotNumber,
      );

      if (existingLot) {
        lotIdTemp = existingLot.idTemp;
      } else {
        // Si el lote no existe, se instancia para ser persistido atómicamente
        const nowLot = new Date().toISOString();
        lotToSave = {
          idTemp: crypto.randomUUID(),
          businessId: input.businessId,
          inventoryProductIdTemp: product.idTemp,
          lotNumber: input.lotNumber,
          manufactureDate: input.manufactureDate ?? null,
          expirationDate: input.expirationDate ?? null,
          createdAt: nowLot,
          updatedAt: nowLot,
        };
        lotIdTemp = lotToSave.idTemp;
      }
    }

    // ============================================================
    // STOCK Y MOVIMIENTO
    // ============================================================
    const existingStock = await this.ports.findStock({
      inventoryProductIdTemp: product.idTemp,
      locationIdTemp: location.idTemp,
      lotIdTemp,
    });

    const now = new Date().toISOString();

    const stock: InventoryStockModel = existingStock ?? {
      idTemp: crypto.randomUUID(),
      businessId: input.businessId,
      inventoryProductIdTemp: product.idTemp,
      locationIdTemp: location.idTemp,
      lotIdTemp,
      quantityBase: 0,
      createdAt: now,
      updatedAt: now,
    };

    stock.quantityBase += finalQuantityBase;
    stock.updatedAt = now;

    const movement: InventoryMovementModel = {
      idTemp: crypto.randomUUID(),
      businessId: input.businessId,
      inventoryProductIdTemp: product.idTemp,
      stockIdTemp: stock.idTemp,
      type: InventoryMovementType.IN,
      quantityBase: finalQuantityBase, // Usamos la cantidad base final calculada
      reason: input.reason,
      referenceType: input.referenceType ?? null,
      referenceIdTemp: input.referenceIdTemp ?? null,
      unitCost: input.unitCost ?? null,
      totalCost:
        input.unitCost != null ? input.unitCost * finalQuantityBase : null,
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? null,
      createdAt: now,
    };

    // Persistencia atómica
    await this.portTransaction.executeAtomic(async () => {
      if (lotToSave) {
        await this.portLot.saveLot(lotToSave);
      }
      await this.ports.saveStock(stock);
      await this.portMovement.saveMovement(movement);
    });

    return stock;
  }

  // ============================================================
  // CONSUME
  // ============================================================

  async consume(input: ConsumeStockInput): Promise<void> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.inventoryProductIdTemp) {
      throw new Error("inventoryProductIdTemp es obligatorio.");
    }

    if (!input.locationIdTemp) {
      throw new Error("locationIdTemp es obligatorio.");
    }

    if (input.quantityBase <= 0) {
      throw new Error("La cantidad a consumir debe ser mayor que cero.");
    }

    if (!input.withdrawalStrategy) {
      throw new Error("withdrawalStrategy es obligatorio.");
    }

    const product = await this.portProduct.findProductByIdTemp(
      input.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    const location = await this.portLocation.findLocationByIdTemp(
      input.locationIdTemp,
    );

    if (!location) {
      throw new Error("Ubicación no encontrada.");
    }

    if (location.businessId !== input.businessId) {
      throw new Error("La ubicación no pertenece al negocio.");
    }

    if (!location.isActive) {
      throw new Error("No se puede consumir stock de una ubicación inactiva.");
    }

    const stocks = await this.ports.findActiveStocksByProduct(
      product.idTemp,
      location.idTemp,
    );

    const selectedStocks = await this.selectStocksForConsumption(stocks, input);

    this.validateSelectedStockQuantity(
      selectedStocks,
      input.quantityBase,
      input.withdrawalStrategy,
    );

    await this.portTransaction.executeAtomic(async () => {
      let remaining = input.quantityBase;

      const now = new Date().toISOString();

      for (const stock of selectedStocks) {
        if (remaining <= 0) {
          break;
        }

        const consumed = Math.min(stock.quantityBase, remaining);

        if (consumed <= 0) {
          continue;
        }

        stock.quantityBase -= consumed;
        stock.updatedAt = now;

        await this.ports.saveStock(stock);

        const movement: InventoryMovementModel = {
          idTemp: crypto.randomUUID(),
          businessId: input.businessId,
          inventoryProductIdTemp: product.idTemp,
          stockIdTemp: stock.idTemp,
          type: InventoryMovementType.OUT,
          quantityBase: consumed,
          reason: input.reason,
          referenceType: input.referenceType ?? null,
          referenceIdTemp: input.referenceIdTemp ?? null,
          unitCost: null,
          totalCost: null,
          notes: input.notes ?? null,
          createdBy: input.createdBy ?? null,
          createdAt: now,
        };

        await this.portMovement.saveMovement(movement);

        remaining -= consumed;
      }

      if (remaining > 0) {
        throw new Error("Stock insuficiente para realizar el consumo.");
      }
    });
  }

  // ============================================================
  // ADJUST
  // ============================================================

  async adjust(input: AdjustStockInput): Promise<InventoryStockModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.inventoryProductIdTemp) {
      throw new Error("inventoryProductIdTemp es obligatorio.");
    }

    if (!input.locationIdTemp) {
      throw new Error("locationIdTemp es obligatorio.");
    }

    if (input.countedQuantityBase < 0) {
      throw new Error("La cantidad contada no puede ser negativa.");
    }

    const product = await this.portProduct.findProductByIdTemp(
      input.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    const location = await this.portLocation.findLocationByIdTemp(
      input.locationIdTemp,
    );

    if (!location) {
      throw new Error("Ubicación no encontrada.");
    }

    if (location.businessId !== input.businessId) {
      throw new Error("La ubicación no pertenece al negocio.");
    }

    if (!location.isActive) {
      throw new Error("No se puede ajustar stock en una ubicación inactiva.");
    }

    const stock = await this.ports.findStock({
      inventoryProductIdTemp: product.idTemp,
      locationIdTemp: location.idTemp,
      lotIdTemp: input.lotIdTemp ?? null,
    });

    if (!stock) {
      throw new Error("No existe stock para realizar el ajuste.");
    }

    const previousQuantity = stock.quantityBase;

    const difference = input.countedQuantityBase - previousQuantity;

    if (difference === 0) {
      return stock;
    }

    const now = new Date().toISOString();

    stock.quantityBase = input.countedQuantityBase;
    stock.updatedAt = now;

    const movement: InventoryMovementModel = {
      idTemp: crypto.randomUUID(),
      businessId: input.businessId,
      inventoryProductIdTemp: product.idTemp,
      stockIdTemp: stock.idTemp,
      type:
        difference > 0 ? InventoryMovementType.IN : InventoryMovementType.OUT,
      quantityBase: Math.abs(difference),
      reason: input.reason,
      referenceType: InventoryMovementReferenceType.STOCKTAKE,
      referenceIdTemp: null,
      unitCost: null,
      totalCost: null,
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? null,
      createdAt: now,
    };

    await this.portTransaction.executeAtomic(async () => {
      await this.ports.saveStock(stock);
      await this.portMovement.saveMovement(movement);
    });

    return stock;
  }

  // ============================================================
  // TRANSFER
  // ============================================================

  async transfer(input: TransferStockInput): Promise<void> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.inventoryProductIdTemp) {
      throw new Error("inventoryProductIdTemp es obligatorio.");
    }

    if (!input.fromLocationIdTemp) {
      throw new Error("fromLocationIdTemp es obligatorio.");
    }

    if (!input.toLocationIdTemp) {
      throw new Error("toLocationIdTemp es obligatorio.");
    }

    if (input.fromLocationIdTemp === input.toLocationIdTemp) {
      throw new Error("La ubicación de origen y destino deben ser diferentes.");
    }

    if (input.quantityBase <= 0) {
      throw new Error("La cantidad a transferir debe ser mayor que cero.");
    }

    const product = await this.portProduct.findProductByIdTemp(
      input.inventoryProductIdTemp,
    );

    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    if (product.businessId !== input.businessId) {
      throw new Error("El producto no pertenece al negocio.");
    }

    const fromLocation = await this.portLocation.findLocationByIdTemp(
      input.fromLocationIdTemp,
    );

    const toLocation = await this.portLocation.findLocationByIdTemp(
      input.toLocationIdTemp,
    );

    if (!fromLocation || !toLocation) {
      throw new Error("Ubicación de origen o destino no encontrada.");
    }

    if (
      fromLocation.businessId !== input.businessId ||
      toLocation.businessId !== input.businessId
    ) {
      throw new Error("Las ubicaciones no pertenecen al negocio.");
    }

    if (!fromLocation.isActive) {
      throw new Error("No se puede transferir desde una ubicación inactiva.");
    }

    if (!toLocation.isActive) {
      throw new Error("No se puede transferir hacia una ubicación inactiva.");
    }

    const sourceStock = await this.ports.findStock({
      inventoryProductIdTemp: product.idTemp,
      locationIdTemp: fromLocation.idTemp,
      lotIdTemp: input.lotIdTemp ?? null,
    });

    if (!sourceStock) {
      throw new Error("No existe stock en la ubicación de origen.");
    }

    if (sourceStock.quantityBase < input.quantityBase) {
      throw new Error("Stock insuficiente para realizar la transferencia.");
    }

    const destinationStock = await this.ports.findStock({
      inventoryProductIdTemp: product.idTemp,
      locationIdTemp: toLocation.idTemp,
      lotIdTemp: input.lotIdTemp ?? null,
    });

    const now = new Date().toISOString();

    const targetStock: InventoryStockModel = destinationStock ?? {
      idTemp: crypto.randomUUID(),
      businessId: input.businessId,
      inventoryProductIdTemp: product.idTemp,
      locationIdTemp: toLocation.idTemp,
      lotIdTemp: input.lotIdTemp ?? null,
      quantityBase: 0,
      createdAt: now,
      updatedAt: now,
    };

    sourceStock.quantityBase -= input.quantityBase;
    sourceStock.updatedAt = now;

    targetStock.quantityBase += input.quantityBase;
    targetStock.updatedAt = now;

    const transferIdTemp = crypto.randomUUID();

    const outgoingMovement: InventoryMovementModel = {
      idTemp: crypto.randomUUID(),
      businessId: input.businessId,
      inventoryProductIdTemp: product.idTemp,
      stockIdTemp: sourceStock.idTemp,
      type: InventoryMovementType.OUT,
      quantityBase: input.quantityBase,
      reason: InventoryMovementReason.TRANSFER,
      referenceType: InventoryMovementReferenceType.TRANSFER,
      referenceIdTemp: transferIdTemp,
      unitCost: null,
      totalCost: null,
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? null,
      createdAt: now,
    };

    const incomingMovement: InventoryMovementModel = {
      idTemp: crypto.randomUUID(),
      businessId: input.businessId,
      inventoryProductIdTemp: product.idTemp,
      stockIdTemp: targetStock.idTemp,
      type: InventoryMovementType.IN,
      quantityBase: input.quantityBase,
      reason: InventoryMovementReason.TRANSFER,
      referenceType: InventoryMovementReferenceType.TRANSFER,
      referenceIdTemp: transferIdTemp,
      unitCost: null,
      totalCost: null,
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? null,
      createdAt: now,
    };

    await this.portTransaction.executeAtomic(async () => {
      await this.ports.saveStock(sourceStock);
      await this.ports.saveStock(targetStock);

      await this.portMovement.saveMovement(outgoingMovement);
      await this.portMovement.saveMovement(incomingMovement);
    });
  }

  // ============================================================
  // STOCK SELECTION
  // ============================================================

  private async selectStocksForConsumption(
    stocks: InventoryStockModel[],
    input: ConsumeStockInput,
  ): Promise<InventoryStockModel[]> {
    if (stocks.length === 0) {
      throw new Error("No existe stock disponible para este producto.");
    }

    switch (input.withdrawalStrategy) {
      // ========================================================
      // LOTE EXPLÍCITO
      // ========================================================

      case StockWithdrawalStrategy.EXPLICIT_LOT: {
        if (!input.lotIdTemp) {
          throw new Error("EXPLICIT_LOT requiere lotIdTemp.");
        }

        const stock = stocks.find((item) => item.lotIdTemp === input.lotIdTemp);

        if (!stock) {
          throw new Error("No existe stock para el lote seleccionado.");
        }

        return [stock];
      }

      // ========================================================
      // SELECCIÓN MANUAL
      // ========================================================

      case StockWithdrawalStrategy.MANUAL_SELECTION: {
        return this.selectStocksManually(stocks, input);
      }

      // ========================================================
      // FIFO
      // ========================================================

      case StockWithdrawalStrategy.FIFO: {
        return [...stocks].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
      }

      // ========================================================
      // LIFO
      // ========================================================

      case StockWithdrawalStrategy.LIFO: {
        return [...stocks].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
      }

      // ========================================================
      // FEFO
      // ========================================================

      case StockWithdrawalStrategy.FEFO: {
        return this.selectStocksByFEFO(stocks);
      }

      default:
        throw new Error(
          `Estrategia de retiro no soportada: ${input.withdrawalStrategy}`,
        );
    }
  }

  // ============================================================
  // MANUAL SELECTION
  // ============================================================

  private selectStocksManually(
    stocks: InventoryStockModel[],
    input: ConsumeStockInput,
  ): InventoryStockModel[] {
    const selections = input.manualSelections;

    if (!selections || selections.length === 0) {
      throw new Error("MANUAL_SELECTION requiere manualSelections.");
    }

    const stockMap = new Map(stocks.map((stock) => [stock.idTemp, stock]));

    const selectedStocks: InventoryStockModel[] = [];

    let totalSelected = 0;

    const selectedStockIds = new Set<string>();

    for (const selection of selections) {
      if (!selection.stockIdTemp) {
        throw new Error("Cada selección manual requiere stockIdTemp.");
      }

      if (selection.quantityBase <= 0) {
        throw new Error("La cantidad seleccionada debe ser mayor que cero.");
      }

      if (selectedStockIds.has(selection.stockIdTemp)) {
        throw new Error(
          `El stock "${selection.stockIdTemp}" fue seleccionado más de una vez.`,
        );
      }

      const stock = stockMap.get(selection.stockIdTemp);

      if (!stock) {
        throw new Error(
          `El stock "${selection.stockIdTemp}" no pertenece a la ubicación seleccionada.`,
        );
      }

      if (selection.quantityBase > stock.quantityBase) {
        throw new Error(
          `La cantidad seleccionada para el stock "${selection.stockIdTemp}" supera el stock disponible.`,
        );
      }

      selectedStockIds.add(selection.stockIdTemp);

      totalSelected += selection.quantityBase;

      /*
       * Guardamos temporalmente la cantidad solicitada
       * mediante una propiedad interna para que consume()
       * pueda respetar exactamente la selección manual.
       *
       * Esta propiedad no se persiste.
       */
      const selectedStock = {
        ...stock,
        quantityBase: selection.quantityBase,
      };

      selectedStocks.push(selectedStock);
    }

    if (totalSelected !== input.quantityBase) {
      throw new Error(
        `La selección manual suma ${totalSelected} unidades, pero se solicitaron ${input.quantityBase}.`,
      );
    }

    return selectedStocks;
  }

  // ============================================================
  // FEFO
  // ============================================================

  private async selectStocksByFEFO(
    stocks: InventoryStockModel[],
  ): Promise<InventoryStockModel[]> {
    const stocksWithExpiration = await Promise.all(
      stocks.map(async (stock) => {
        if (!stock.lotIdTemp) {
          return {
            stock,
            expirationDate: null as string | null,
          };
        }

        const lot = await this.portLot.findLotByIdTemp(stock.lotIdTemp);

        if (!lot) {
          throw new Error(
            `No se encontró el lote "${stock.lotIdTemp}" asociado al stock.`,
          );
        }

        return {
          stock,
          expirationDate: lot.expirationDate,
        };
      }),
    );

    const lotStocks = stocksWithExpiration.filter(
      (item) => item.expirationDate !== null,
    );

    const nonLotStocks = stocksWithExpiration.filter(
      (item) => item.expirationDate === null,
    );

    lotStocks.sort((a, b) =>
      a.expirationDate!.localeCompare(b.expirationDate!),
    );

    /*
     * Los stocks sin lote no tienen vencimiento.
     *
     * Los dejamos después de los stocks con lote,
     * porque FEFO solamente puede ordenar por vencimiento
     * cuando existe una fecha.
     */
    return [
      ...lotStocks.map((item) => item.stock),
      ...nonLotStocks.map((item) => item.stock),
    ];
  }

  // ============================================================
  // VALIDACIÓN DE STOCK SELECCIONADO
  // ============================================================

  private validateSelectedStockQuantity(
    stocks: InventoryStockModel[],
    requestedQuantity: number,
    strategy: StockWithdrawalStrategy,
  ): void {
    const totalAvailable = stocks.reduce(
      (total, stock) => total + stock.quantityBase,
      0,
    );

    if (strategy === StockWithdrawalStrategy.MANUAL_SELECTION) {
      if (totalAvailable !== requestedQuantity) {
        throw new Error(
          "La selección manual no coincide con la cantidad solicitada.",
        );
      }

      return;
    }

    if (totalAvailable < requestedQuantity) {
      throw new Error("Stock insuficiente para realizar el consumo.");
    }
  }
}
