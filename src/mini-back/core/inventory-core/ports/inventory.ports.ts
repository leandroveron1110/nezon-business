// // src/cores/inventory-core/ports/inventory.ports.ts

// import { InventoryBaseUnitModel } from "../domain/models/inventory-base-unit.model";
// import { InventoryLocationModel } from "../domain/models/inventory-location.model";
// import { InventoryLotModel } from "../domain/models/inventory-lot.model";
// import { InventoryMovementModel } from "../domain/models/inventory-movement.model";
// import { InventoryPhysicalStockModel } from "../domain/models/inventory-physical-stock.model";
// import { InventoryPresentationModel } from "../domain/models/inventory-presentation.model";
// import { InventoryProductModel } from "../domain/models/inventory-product.model";
// import { InventoryStockModel } from "../domain/models/inventory-stock.model";

// export interface InventoryPorts {
//   // ============================================================
//   // UNIDADES BASE
//   // ============================================================

//   findBaseUnitByIdTemp(idTemp: string): Promise<InventoryBaseUnitModel | null>;

//   findAllBaseUnits(): Promise<InventoryBaseUnitModel[]>;

//   saveBaseUnit(baseUnit: InventoryBaseUnitModel): Promise<void>;

//   // ============================================================
//   // UBICACIONES
//   // ============================================================

//   findLocationByIdTemp(idTemp: string): Promise<InventoryLocationModel | null>;

//   findAllLocations(businessId: string): Promise<InventoryLocationModel[]>;

//   saveLocation(location: InventoryLocationModel): Promise<void>;

//   // ============================================================
//   // PRODUCTOS
//   // ============================================================

//   findProductByIdTemp(idTemp: string): Promise<InventoryProductModel | null>;

//   findProductByCode(
//     businessId: string,
//     code: string,
//   ): Promise<InventoryProductModel | null>;

//   findAllProducts(businessId: string): Promise<InventoryProductModel[]>;

//   saveProduct(product: InventoryProductModel): Promise<void>;

//   // ============================================================
//   // PRESENTACIONES
//   // ============================================================

//   findPresentationByIdTemp(
//     idTemp: string,
//   ): Promise<InventoryPresentationModel | null>;

//   findPresentationsByProduct(
//     inventoryProductIdTemp: string,
//   ): Promise<InventoryPresentationModel[]>;

//   savePresentation(presentation: InventoryPresentationModel): Promise<void>;

//   // ============================================================
//   // LOTES
//   // ============================================================

//   findLotByIdTemp(idTemp: string): Promise<InventoryLotModel | null>;

//   findLotByNumber(
//     inventoryProductIdTemp: string,
//     lotNumber: string,
//   ): Promise<InventoryLotModel | null>;

//   findActiveLotsByProduct(
//     inventoryProductIdTemp: string,
//   ): Promise<InventoryLotModel[]>;

//   saveLot(lot: InventoryLotModel): Promise<void>;

//   // ============================================================
//   // STOCK — ESTADO ACTUAL
//   // ============================================================

//   findStock(params: {
//     inventoryProductIdTemp: string;
//     locationIdTemp: string;
//     lotIdTemp?: string | null;
//   }): Promise<InventoryStockModel | null>;

//   findActiveStocksByProduct(
//     inventoryProductIdTemp: string,
//     locationIdTemp?: string,
//   ): Promise<InventoryStockModel[]>;

//   saveStock(stock: InventoryStockModel): Promise<void>;

//   // ============================================================
//   // DESGLOSE FÍSICO
//   // ============================================================

//   findPhysicalStockByStock(
//     stockIdTemp: string,
//   ): Promise<InventoryPhysicalStockModel[]>;

//   savePhysicalStock(physicalStock: InventoryPhysicalStockModel): Promise<void>;

//   // ============================================================
//   // MOVIMIENTOS — APPEND ONLY
//   // ============================================================

//   saveMovement(movement: InventoryMovementModel): Promise<void>;

//   findMovementsByProduct(
//     inventoryProductIdTemp: string,
//     limit?: number,
//   ): Promise<InventoryMovementModel[]>;

//   // ============================================================
//   // ATOMICIDAD
//   // ============================================================

//   executeAtomic(operation: () => Promise<void>): Promise<void>;
// }

