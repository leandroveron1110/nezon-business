// src/cores/inventory-core/public/stock-service.interface.ts

import { InventoryStockModel } from "../domain/models/inventory-stock.model";

import { ReceiveStockInput } from "../inputs/stock/receive-stock.input";
import { ConsumeStockInput } from "../inputs/stock/consume-stock.input";
import { AdjustStockInput } from "../inputs/stock/adjust-stock.input";
import { TransferStockInput } from "../inputs/stock/transfer-stock.input";

export interface IStockPublicService {
  findByBusinessId(businessId: string): Promise<InventoryStockModel[]>
  
  receive(input: ReceiveStockInput): Promise<InventoryStockModel>;

  consume(input: ConsumeStockInput): Promise<void>;

  adjust(input: AdjustStockInput): Promise<InventoryStockModel>;

  transfer(input: TransferStockInput): Promise<void>;

  findStock(params: {
    inventoryProductIdTemp: string;
    locationIdTemp: string;
    lotIdTemp?: string | null;
  }): Promise<InventoryStockModel | null>;

  findByProduct(
    inventoryProductIdTemp: string,
    locationIdTemp?: string,
  ): Promise<InventoryStockModel[]>;
}
