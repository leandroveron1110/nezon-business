// signals/inventory.signals.ts

import { InventoryMovementReason } from "../domain/enums/inventory-movement-reason.enum";

export interface StockReceivedSignal {
  type: "STOCK_RECEIVED";
  payload: {
    movementIdTemp: string;
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
    quantityBase: number;
    newTotalStockBase: number;
    timestamp: string;
  };
}

export interface StockConsumedSignal {
  type: "STOCK_CONSUMED";
  payload: {
    movementIdTemp: string;
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
    quantityBase: number;
    reason: InventoryMovementReason;
    remainingStockBase: number;
    timestamp: string;
  };
}

export interface StockTransferredSignal {
  type: "STOCK_TRANSFERRED";
  payload: {
    outMovementIdTemp: string;
    inMovementIdTemp: string;
    inventoryProductIdTemp: string;
    fromLocationIdTemp: string;
    toLocationIdTemp: string;
    quantityBase: number;
    timestamp: string;
  };
}

export interface StockAdjustedSignal {
  type: "STOCK_ADJUSTED";
  payload: {
    movementIdTemp: string;
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    previousQuantityBase: number;
    newQuantityBase: number;
    deltaQuantityBase: number;
    timestamp: string;
  };
}
