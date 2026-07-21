import { CashRegister } from "../domain/cash-register";
import { CashRegisterStatus } from "../domain/cash-register-status.enum";
import { FinancialMovementStatus, FinancialMovementType } from "../domain/financial-movement-status.enum";
import { CloseCashRegisterInput } from "../input/close.input";
import { InitializeCashRegisterInput } from "../input/initialize.input";
import { OpenCashRegisterInput } from "../input/open.input";
import { CashRegisterPort } from "../port/cash-register.port";
import { FinancialMovementPort } from "../port/financial-movement.port";

export class CashRegisterService {
  constructor(
    private readonly cashRegister: CashRegisterPort,
    private readonly financialMovement: FinancialMovementPort,
  ) {}

  async initialize(input: InitializeCashRegisterInput): Promise<CashRegister> {
    const active = await this.cashRegister.findActive(input.businessId);

    if (active) {
      return active;
    }

    return this.open({
      businessId: input.businessId,
      userId: input.userId,
      clientTurnId: input.clientTurnId,
      openingAmount: input.openingAmount,
      openingNotes: input.openingNotes,
    });
  }

  async open(input: OpenCashRegisterInput): Promise<CashRegister> {
    const existingClient = await this.cashRegister.findByClientTurnId(
      input.clientTurnId,
    );

    if (existingClient) {
      return existingClient;
    }

    const active = await this.cashRegister.findActive(input.businessId);

    if (active) {
      throw new Error("Ya existe una caja abierta.");
    }

    const cashRegister: CashRegister = {
      id: crypto.randomUUID(),

      clientTurnId: input.clientTurnId,

      businessId: input.businessId,

      openedByUserId: input.userId,

      openingDate: new Date(),

      openingAmount: input.openingAmount,

      openingNotes: input.openingNotes,

      status: CashRegisterStatus.OPEN,
    };

    return this.cashRegister.save(cashRegister);
  }

  async reopen(businessId: string, turnId: string): Promise<CashRegister> {
    const active = await this.cashRegister.findActive(businessId);

    if (active) {
      throw new Error("Ya existe una caja abierta.");
    }

    const turn = await this.cashRegister.findById(turnId);

    if (!turn) {
      throw new Error("Caja inexistente.");
    }

    if (turn.status === CashRegisterStatus.OPEN) {
      return turn;
    }

    turn.status = CashRegisterStatus.OPEN;

    turn.closedByUserId = undefined;
    turn.closingDate = undefined;

    turn.declaredClosingAmount = undefined;
    turn.systemClosingAmount = undefined;
    turn.difference = undefined;
    turn.closingNotes = undefined;

    return this.cashRegister.save(turn);
  }

  async close(input: CloseCashRegisterInput): Promise<CashRegister> {

  const turn = await this.cashRegister.findActive(input.businessId);

  if (!turn) {
    throw new Error("No existe una caja abierta.");
  }

  const movements =
    await this.financialMovement.findByCashRegister(turn.id);

  let systemAmount = turn.openingAmount;

  for (const movement of movements) {

    if (movement.status !== FinancialMovementStatus.CONFIRMED) {
      continue;
    }

    switch (movement.type) {

      case FinancialMovementType.SALE:
      case FinancialMovementType.INCOME:
        systemAmount += movement.amount;
        break;

      case FinancialMovementType.REFUND:
      case FinancialMovementType.EXPENSE:
        systemAmount -= movement.amount;
        break;
    }
  }

  turn.closedByUserId = input.userId;

  turn.closingDate = new Date();

  turn.declaredClosingAmount = input.declaredClosingAmount;

  turn.systemClosingAmount = systemAmount;

  turn.difference =
    input.declaredClosingAmount - systemAmount;

  turn.closingNotes = input.closingNotes;

  turn.status = CashRegisterStatus.CLOSED;

  return this.cashRegister.save(turn);
}
}
