import { InventoryTransactionPorts } from "@/mini-back/core/inventory-core/ports/inventory-transaction.ports";
import { db } from "../../db";

export class InventoryTransactionRepository implements InventoryTransactionPorts {
  async executeAtomic(operation: () => Promise<void>): Promise<void> {
    await db.transaction(
      "rw",
      [db.inventoryStocks, db.inventoryMovements, db.inventoryPhysicalStocks, db.inventoryLots],
      operation,
    );
  }
}
