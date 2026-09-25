// src/cores/inventory-core/public/inventory-services.public.ts

import { IBaseUnitPublicService } from "./base-unit-service.interface";
import { ILocationPublicService } from "./location-service.interface";
import { IProductPublicService } from "./product-service.interface";
import { IPresentationPublicService } from "./presentation-service.interface";
import { ILotPublicService } from "./lot-service.interface";
import { IStockPublicService } from "./stock-service.interface";
import { BaseUnitService } from "../services/base-unit/base-unit.service";
import { LocationService } from "../services/location/location.service";
import { ProductService } from "../services/product/product.service";
import { PresentationService } from "../services/presentation/presentation.service";
import { LotService } from "../services/lot/lot.service";
import { StockService } from "../services/stock/stock.service";
import { InventoryBaseUnitPorts } from "../ports/inventory-base-unit.ports";
import { InventoryLocationPorts } from "../ports/inventory-location.ports";
import { InventoryProductPorts } from "../ports/inventory-product.ports";
import { InventoryPresentationPorts } from "../ports/inventory-presentation.ports";
import { InventoryLotPorts } from "../ports/inventory-lot.ports";
import { InventoryStockPorts } from "../ports/inventory-stock.ports";
import { InventoryMovementPorts } from "../ports/inventory-movement.ports";
import { InventoryTransactionPorts } from "../ports/inventory-transaction.ports";

export const LotServicePublic = (dependencies: {
  lot: InventoryLotPorts;
  product: InventoryProductPorts;
}): ILotPublicService => {
  return new LotService(dependencies.lot, dependencies.product);
};

export const BaseUnitServicePublic = (dependencies: {
  baseUnit: InventoryBaseUnitPorts;
}): IBaseUnitPublicService => {
  return new BaseUnitService(dependencies.baseUnit);
};

export const ProductServicePublic = (dependencies: {
  product: InventoryProductPorts;
}): IProductPublicService => {
  return new ProductService(dependencies.product);
};

export const LocationServicePublic = (dependencies: {
  location: InventoryLocationPorts;
}): ILocationPublicService => {
  return new LocationService(dependencies.location);
};

export const PresentationServicePublic = (dependencies: {
  presentation: InventoryPresentationPorts;
  product: InventoryProductPorts;
}): IPresentationPublicService => {
  return new PresentationService(
    dependencies.presentation,
    dependencies.product,
  );
};

export const StockServicePublic = (dependencies: {
  stock: InventoryStockPorts;
  product: InventoryProductPorts;
  lot: InventoryLotPorts;
  location: InventoryLocationPorts;
  movement: InventoryMovementPorts;
  transaction: InventoryTransactionPorts;
  presentation: InventoryPresentationPorts;
}): IStockPublicService => {
  return new StockService(
    dependencies.stock,
    dependencies.product,
    dependencies.lot,
    dependencies.location,
    dependencies.movement,
    dependencies.transaction,
    dependencies.presentation
  );
};
