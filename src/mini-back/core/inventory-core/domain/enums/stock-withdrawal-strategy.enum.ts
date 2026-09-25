// src/cores/inventory-core/domain/enums/stock-withdrawal-strategy.enum.ts

export enum StockWithdrawalStrategy {
  FEFO = "FEFO",                   // First Expired, First Out (Primero en vencer)
  FIFO = "FIFO",                   // First In, First Out (Primero en ingresar)
  LIFO = "LIFO",                   // Last In, First Out (Último en ingresar)
  EXPLICIT_LOT = "EXPLICIT_LOT",   // Lote específico seleccionado manualmente
  MANUAL_SELECTION = "MANUAL_SELECTION" // Selección manual libre de varias líneas
}