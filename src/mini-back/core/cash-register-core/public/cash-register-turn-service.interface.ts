import { CashRegisterTurn } from "../domain/cash-register-turn";
import { CloseCashRegisterTurnInput } from "../input/close.input";
import { HistoryFiltersInput } from "../input/hitory-filter.input";
import { InitializeCashRegisterTurnInput } from "../input/initialize.input";
import { OpenCashRegisterTurnInput } from "../input/open.input";
import { CashRegisterTurnActiveTurnTotals } from "../port/cash-register-turn.port";

export interface ICashRegisterTurnService {

    initialize(input: InitializeCashRegisterTurnInput): Promise<CashRegisterTurn>

    open(input: OpenCashRegisterTurnInput): Promise<CashRegisterTurn>

    reopen(businessId: string, turnId: string): Promise<CashRegisterTurn>

    close(input: CloseCashRegisterTurnInput, port: CashRegisterTurnActiveTurnTotals): Promise<CashRegisterTurn | null>

    historyCashRegiter(filter: HistoryFiltersInput): Promise<CashRegisterTurn[]>

    getCashTurn(businessId: string): Promise<{clientTurnId: string, treasuryAccountId: string, cashRegisterId: string}>

}