import { CashRegister } from "../domain/cash-register";
import { CashRegisterTotals } from "../domain/cash-register-totals";
import { CloseCashRegisterInput } from "../input/close.input";
import { HistoryFiltersInput } from "../input/hitory-filter.input";
import { InitializeCashRegisterInput } from "../input/initialize.input";
import { OpenCashRegisterInput } from "../input/open.input";
import { CashRegisterActiveTurnTotals } from "../port/cash-register.port";

export interface ICashRegisterService {

    initialize(input: InitializeCashRegisterInput): Promise<CashRegister>

    open(input: OpenCashRegisterInput): Promise<CashRegister>

    reopen(businessId: string, turnId: string): Promise<CashRegister>

    close(input: CloseCashRegisterInput, port: CashRegisterActiveTurnTotals): Promise<CashRegister | null>

    historyCashRegiter(filter: HistoryFiltersInput): Promise<CashRegister[]>

    getCashTurn(businessId: string): Promise<{clientTurnId?: string}>

}