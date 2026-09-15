import { FinancialMovement } from "../domain/financial-movement/financial-movement";

import { RegisterSaleInput } from "../input/financial-movement/register-sale.input";
import { RegisterRefundInput } from "../input/financial-movement/register-refund.input";
import { RegisterIncomeInput } from "../input/financial-movement/register-income.input";
import { RegisterExpenseInput } from "../input/financial-movement/register-expense.input";
import { RegisterCogsInput } from "../input/financial-movement/register-cogs.Input";
import { RegisterMermaInput } from "../input/financial-movement/register-merma.input";

import { FianancialTotals } from "../signal/financial-movement/financial-movement-totals.signal";
import { RegisterInternalTransferInput } from "../input/financial-movement/register-internal-transfer.input";

export interface IFinancialMovementPublicService {
  // Registra una entrada de dinero producida por una venta.
  registerSale(input: RegisterSaleInput): Promise<FinancialMovement>;

  // Registra una devolución de dinero al cliente.
  registerRefund(input: RegisterRefundInput): Promise<FinancialMovement>;

  /**
   * Registra un ingreso de dinero que no corresponde
   * directamente a una venta.
   */
  registerIncome(input: RegisterIncomeInput): Promise<FinancialMovement>;

  /**
   * Registra una salida de dinero por un gasto.
   */
  registerExpense(input: RegisterExpenseInput): Promise<FinancialMovement>;

  /**
   * Registra el costo económico de mercadería vendida.
   *
   * No afecta directamente ninguna cuenta de tesorería.
   */
  registerCogs(input: RegisterCogsInput): Promise<FinancialMovement>;

  /**
   * Registra una pérdida real de dinero.
   *
   * Afecta la cuenta de tesorería indicada.
   */
  registerMerma(input: RegisterMermaInput): Promise<FinancialMovement>;

  /**
   * Registra un movimiento interno entre dos cuentas
   * de tesorería del mismo negocio.
   *
   * El dinero no entra ni sale del negocio, solamente
   * cambia de ubicación.
   */
  registerInternalTransfer(
    input: RegisterInternalTransferInput,
  ): Promise<FinancialMovement[]>;

  /**
   * Obtiene los totales financieros correspondientes
   * al turno de caja activo.
   */
  getActiveTurnTotals(clientTurnId: string): Promise<FianancialTotals>;
}
