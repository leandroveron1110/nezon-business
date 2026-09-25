// import {
//   InventoryBaseUnitModel,
//   InventoryLocationModel,
//   InventoryLotModel,
//   InventoryMovementModel,
//   InventoryPhysicalStockModel,
//   InventoryPorts,
//   InventoryPresentationModel,
//   InventoryProductModel,
//   InventoryStockModel,
// } from "@/mini-back/core/inventory-core/public";
// import { db } from "../../db";
// import { LocalInventoryBaseUnit } from "../../shcema/inventory/inventory-base-unit.schema";
// import { LocalInventoryLocation } from "../../shcema/inventory/inventory-location.schema";
// import { LocalInventoryProduct } from "../../shcema/inventory/inventory-product.schema";
// import { LocalInventoryPresentation } from "../../shcema/inventory/inventory-presentation.schema";
// import { LocalInventoryLot } from "../../shcema/inventory/inventory-lot.schema";
// import { LocalInventoryStock } from "../../shcema/inventory/inventory-stock.schema";
// import { LocalInventoryPhysicalStock } from "../../shcema/inventory/inventory-physical-stock.schema";
// import { LocalInventoryMovement } from "../../shcema/inventory/inventory-movement.schema";

// export class InventoryRepository implements InventoryPorts {
//   // ============================================================
//   // UNIDADES BASE
//   // ============================================================

//   async findBaseUnitByIdTemp(
//     idTemp: string,
//   ): Promise<InventoryBaseUnitModel | null> {
//     const record = await db.inventoryBaseUnits.get(idTemp);

//     return record ? (record as InventoryBaseUnitModel) : null;
//   }

//   async findAllBaseUnits(): Promise<InventoryBaseUnitModel[]> {
//     const records = await db.inventoryBaseUnits.toArray();

//     return records as InventoryBaseUnitModel[];
//   }

//   async saveBaseUnit(baseUnit: InventoryBaseUnitModel): Promise<void> {
//     await db.inventoryBaseUnits.put(baseUnit as LocalInventoryBaseUnit);
//   }

//   // ============================================================
//   // UBICACIONES
//   // ============================================================

//   async findLocationByIdTemp(
//     idTemp: string,
//   ): Promise<InventoryLocationModel | null> {
//     const record = await db.inventoryLocations.get(idTemp);

//     return record ? (record as InventoryLocationModel) : null;
//   }

//   async findAllLocations(
//     businessId: string,
//   ): Promise<InventoryLocationModel[]> {
//     const records = await db.inventoryLocations
//       .where("businessId")
//       .equals(businessId)
//       .toArray();

//     return records as InventoryLocationModel[];
//   }

//   async saveLocation(location: InventoryLocationModel): Promise<void> {
//     await db.inventoryLocations.put(location as LocalInventoryLocation);
//   }

//   // ============================================================
//   // PRODUCTOS
//   // ============================================================

//   async findProductByIdTemp(
//     idTemp: string,
//   ): Promise<InventoryProductModel | null> {
//     const record = await db.inventoryProducts.get(idTemp);

//     return record ? (record as InventoryProductModel) : null;
//   }

//   async findProductByCode(
//     businessId: string,
//     code: string,
//   ): Promise<InventoryProductModel | null> {
//     const record = await db.inventoryProducts
//       .where("code")
//       .equals(code)
//       .filter((product) => product.businessId === businessId)
//       .first();

//     return record ? (record as InventoryProductModel) : null;
//   }

//   async findAllProducts(businessId: string): Promise<InventoryProductModel[]> {
//     const records = await db.inventoryProducts
//       .where("businessId")
//       .equals(businessId)
//       .toArray();

//     return records as InventoryProductModel[];
//   }

//   async saveProduct(product: InventoryProductModel): Promise<void> {
//     await db.inventoryProducts.put(product as LocalInventoryProduct);
//   }

//   // ============================================================
//   // PRESENTACIONES
//   // ============================================================

//   async findPresentationByIdTemp(
//     idTemp: string,
//   ): Promise<InventoryPresentationModel | null> {
//     const record = await db.inventoryPresentations.get(idTemp);

//     return record ? (record as InventoryPresentationModel) : null;
//   }

//   async findPresentationsByProduct(
//     inventoryProductIdTemp: string,
//   ): Promise<InventoryPresentationModel[]> {
//     const records = await db.inventoryPresentations
//       .where("inventoryProductIdTemp")
//       .equals(inventoryProductIdTemp)
//       .toArray();

//     return records as InventoryPresentationModel[];
//   }

//   async savePresentation(
//     presentation: InventoryPresentationModel,
//   ): Promise<void> {
//     await db.inventoryPresentations.put(
//       presentation as LocalInventoryPresentation,
//     );
//   }

//   // ============================================================
//   // LOTES
//   // ============================================================

//   async findLotByIdTemp(idTemp: string): Promise<InventoryLotModel | null> {
//     const record = await db.inventoryLots.get(idTemp);

//     return record ? (record as InventoryLotModel) : null;
//   }

//   async findLotByNumber(
//     inventoryProductIdTemp: string,
//     lotNumber: string,
//   ): Promise<InventoryLotModel | null> {
//     const record = await db.inventoryLots
//       .where("inventoryProductIdTemp")
//       .equals(inventoryProductIdTemp)
//       .filter((lot) => lot.lotNumber === lotNumber)
//       .first();

//     return record ? (record as InventoryLotModel) : null;
//   }

//   async findActiveLotsByProduct(
//     inventoryProductIdTemp: string,
//   ): Promise<InventoryLotModel[]> {
//     /*
//      * Los lotes actualmente no tienen isActive en el schema.
//      *
//      * Por eso "active" aquí significa simplemente
//      * lotes pertenecientes al producto.
//      */
//     const records = await db.inventoryLots
//       .where("inventoryProductIdTemp")
//       .equals(inventoryProductIdTemp)
//       .toArray();

//     return records as InventoryLotModel[];
//   }

//   async saveLot(lot: InventoryLotModel): Promise<void> {
//     await db.inventoryLots.put(lot as LocalInventoryLot);
//   }

//   // ============================================================
//   // STOCK — ESTADO ACTUAL
//   // ============================================================

//   async findStock(params: {
//     inventoryProductIdTemp: string;
//     locationIdTemp: string;
//     lotIdTemp?: string | null;
//   }): Promise<InventoryStockModel | null> {
//     const { inventoryProductIdTemp, locationIdTemp, lotIdTemp = null } = params;

//     const record = await db.inventoryStocks
//       .where("inventoryProductIdTemp")
//       .equals(inventoryProductIdTemp)
//       .filter(
//         (stock) =>
//           stock.locationIdTemp === locationIdTemp &&
//           (stock.lotIdTemp ?? null) === lotIdTemp,
//       )
//       .first();

//     return record ? (record as InventoryStockModel) : null;
//   }

//   async findActiveStocksByProduct(
//     inventoryProductIdTemp: string,
//     locationIdTemp?: string,
//   ): Promise<InventoryStockModel[]> {
//     let query = db.inventoryStocks
//       .where("inventoryProductIdTemp")
//       .equals(inventoryProductIdTemp);

//     if (locationIdTemp !== undefined) {
//       const records = await query
//         .filter(
//           (stock) =>
//             stock.locationIdTemp === locationIdTemp && stock.quantityBase > 0,
//         )
//         .toArray();

//       return records as InventoryStockModel[];
//     }

//     const records = await query
//       .filter((stock) => stock.quantityBase > 0)
//       .toArray();

//     return records as InventoryStockModel[];
//   }

//   async saveStock(stock: InventoryStockModel): Promise<void> {
//     await db.inventoryStocks.put(stock as LocalInventoryStock);
//   }

//   // ============================================================
//   // DESGLOSE FÍSICO
//   // ============================================================

//   async findPhysicalStockByStock(
//     stockIdTemp: string,
//   ): Promise<InventoryPhysicalStockModel[]> {
//     const records = await db.inventoryPhysicalStocks
//       .where("stockIdTemp")
//       .equals(stockIdTemp)
//       .toArray();

//     return records as InventoryPhysicalStockModel[];
//   }

//   async savePhysicalStock(
//     physicalStock: InventoryPhysicalStockModel,
//   ): Promise<void> {
//     await db.inventoryPhysicalStocks.put(
//       physicalStock as LocalInventoryPhysicalStock,
//     );
//   }

//   // ============================================================
//   // MOVIMIENTOS — APPEND ONLY
//   // ============================================================

//   async saveMovement(movement: InventoryMovementModel): Promise<void> {
//     await db.inventoryMovements.add(movement as LocalInventoryMovement);
//   }

//   async findMovementsByProduct(
//     inventoryProductIdTemp: string,
//     limit?: number,
//   ): Promise<InventoryMovementModel[]> {
//     let records = await db.inventoryMovements
//       .where("inventoryProductIdTemp")
//       .equals(inventoryProductIdTemp)
//       .reverse()
//       .sortBy("createdAt");

//     if (limit !== undefined) {
//       records = records.slice(0, limit);
//     }

//     return records as InventoryMovementModel[];
//   }

//   // ============================================================
//   // ATOMICIDAD
//   // ============================================================

//   async executeAtomic(operation: () => Promise<void>): Promise<void> {
//     await db.transaction(
//       "rw",
//       [db.inventoryStocks, db.inventoryMovements, db.inventoryPhysicalStocks],
//       operation,
//     );
//   }
// }
