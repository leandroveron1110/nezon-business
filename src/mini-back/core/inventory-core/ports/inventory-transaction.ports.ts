// src/cores/inventory-core/ports/inventory-transaction.ports.ts

export interface InventoryTransactionPorts {
  executeAtomic(operation: () => Promise<void>): Promise<void>;
}
