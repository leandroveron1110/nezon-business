import { CashRegisterTurn } from "../domain/cash-register-turn";
import { CashRegisterTurnStatus } from "../domain/cash-register-turn-status.enum";

import { CloseCashRegisterTurnInput } from "../input/close.input";
import { HistoryFiltersInput } from "../input/hitory-filter.input";
import { InitializeCashRegisterTurnInput } from "../input/initialize.input";
import { OpenCashRegisterTurnInput } from "../input/open.input";

import {
  CashRegisterTurnActiveTurnTotals,
  CashRegisterTurnPort,
} from "../port/cash-register-turn.port";
import { CashRegisterPort } from "../port/cash-register.port";
import { ICashRegisterTurnService } from "../public/cash-register-turn-service.interface";

export class CashRegisterTurnService implements ICashRegisterTurnService {
  constructor(
    private readonly CashRegisterTurn: CashRegisterTurnPort,
    private readonly CashRegisterPort: CashRegisterPort, // Repositorio de cajas registradoras físicas
  ) {}
  reopen(businessId: string, turnId: string): Promise<CashRegisterTurn> {
    throw new Error("Method not implemented.");
  }

  async getCashTurn(
    businessId: string,
  ): Promise<{ clientTurnId: string; treasuryAccountId: string; cashRegisterId: string }> {
    const turnId = await this.CashRegisterTurn.findActive(businessId);

    if (!turnId || !turnId.clientTurnId || !turnId.treasuryAccountId) {
      throw new Error("No active cash register found for this business.");
    }

    return {
      clientTurnId: turnId.clientTurnId,
      treasuryAccountId: turnId.treasuryAccountId,
      cashRegisterId: turnId.cashRegisterId
    };
  }

  async initialize(
    input: InitializeCashRegisterTurnInput,
  ): Promise<CashRegisterTurn> {
    const active = await this.CashRegisterTurn.findActive(input.businessId);

    if (active) {
      return active;
    }

    return this.open({
      businessId: input.businessId,
      userId: input.userId,
      clientTurnId: input.clientTurnId, // Opcional: si viene de la app cliente/UI
      openingAmount: input.openingAmount,
      openingNotes: input.openingNotes,
      cashRegisterId: input.cashRegisterId,
      treasuryAccountId: input.treasuryAccountId, // Asumimos que el treasuryAccountId es el mismo que el businessId para simplificar
    });
  }

  async historyCashRegiter(
    filter: HistoryFiltersInput,
  ): Promise<CashRegisterTurn[]> {
    if (!filter.businessId) {
      throw new Error(
        "El businessId es requerido para consultar el historial.",
      );
    }

    // 1. Consultar a través de tu repositorio/capa de datos (IndexedDB/Dexie)
    // Se filtran por negocio y se ordenan por apertura descendente (más recientes primero)
    let turns = await this.CashRegisterTurn.findByBusinessId(filter.businessId);

    // 2. Aplicar filtros en memoria si vienen especificados
    if (filter?.startDate) {
      turns = turns.filter(
        (turn) => new Date(turn.openingDate) >= filter.startDate!,
      );
    }

    if (filter?.endDate) {
      turns = turns.filter(
        (turn) => new Date(turn.openingDate) <= filter.endDate!,
      );
    }

    // 3. Ordenar siempre los más recientes primero
    turns.sort(
      (a, b) =>
        new Date(b.openingDate).getTime() - new Date(a.openingDate).getTime(),
    );

    // 4. Paginación / Límite
    const offset = filter?.offset || 0;
    const limit = filter?.limit;

    if (limit) {
      return turns.slice(offset, offset + limit);
    }

    return turns;
  }

  async open(input: OpenCashRegisterTurnInput): Promise<CashRegisterTurn> {
    // 1. Idempotencia: Si la UI mandó un ID local previo, verificamos si ya existe
    if (input.clientTurnId) {
      const existingClient = await this.CashRegisterTurn.findByClientTurnId(
        input.clientTurnId,
      );
      if (existingClient) {
        return existingClient;
      }
    }

    // 2. Verificar que la caja física exista
    const cashRegisterEntity = await this.CashRegisterPort.exist(
      input.cashRegisterId,
    );
    if (!cashRegisterEntity) {
      throw new Error(
        "La caja registradora seleccionada no existe o está inactiva.",
      );
    }

    // 3. Regla de Negocio: Solo un turno activo POR CAJA FÍSICA (no por negocio)
    const active = await this.CashRegisterTurn.findActiveByCashRegisterId(
      input.businessId,
      input.cashRegisterId,
    );
    if (active) {
      throw new Error("Ya existe una caja abierta para este negocio.");
    }

    // 3. Creación del objeto de dominio SIN forzar UUIDs de Infraestructura
    const CashRegisterTurn: Partial<CashRegisterTurn> = {
      clientTurnId: input.clientTurnId,
      businessId: input.businessId,
      openedByUserId: input.userId,
      cashRegisterId: input.cashRegisterId,
      openingDate: new Date(),
      openingAmount: input.openingAmount,
      openingNotes: input.openingNotes,
      status: CashRegisterTurnStatus.OPEN,
      treasuryAccountId: input.treasuryAccountId,
    };

    // El repositorio se encarga de asignar el ID definitivo/local si no viene uno
    return this.CashRegisterTurn.save(CashRegisterTurn as CashRegisterTurn);
  }

  // 🛠️ DENTRO DE CashRegisterTurnService.ts (Método close)

  async close(
    input: CloseCashRegisterTurnInput,
    port: CashRegisterTurnActiveTurnTotals,
  ): Promise<CashRegisterTurn> {
    const turn = await this.CashRegisterTurn.findActive(input.businessId);

    if (!turn) {
      throw new Error("No existe una caja abierta para este negocio.");
    }

    const turnIdentifier = turn.clientTurnId;

    if (!turnIdentifier) {
      throw new Error("El turno activo no posee un identificador válido.");
    }

    // 1. Totales de movimientos del turno (Neto operado)
    const totals = await port.getActiveTurnTotals(turnIdentifier);

    const netCashOperated = totals.cash;
    const openingAmount = turn.openingAmount || 0;

    // 2. El dinero esperado TOTAL en el cajón físico (Fondo + Neto Operado)
    const totalExpectedInDrawer = openingAmount + netCashOperated;

    // 3. Mutación limpia de la entidad de dominio
    turn.closedByUserId = input.userId;
    turn.closingDate = new Date();
    turn.declaredClosingAmount = input.declaredClosingAmount;

    // Guardamos el neto operado en systemClosingAmount
    turn.systemClosingAmount = netCashOperated;

    // 💥 REGLA DE NEGOCIO CORREGIDA:
    // Arqueo = Declarado - Esperado Real en Cajón
    turn.difference = input.declaredClosingAmount - totalExpectedInDrawer;

    turn.closingNotes = input.closingNotes;
    turn.status = CashRegisterTurnStatus.CLOSED;

    return this.CashRegisterTurn.close(turn);
  }
}
