import { CashRegister } from "../domain/cash-register";
import { CashRegisterTotals } from "../domain/cash-register-totals";
import { CloseCashRegisterInput } from "../input/close.input";
import { InitializeCashRegisterInput } from "../input/initialize.input";
import { OpenCashRegisterInput } from "../input/open.input";

export interface ICashRegisterService {

    initialize(input: InitializeCashRegisterInput): Promise<CashRegister>

    open(input: OpenCashRegisterInput): Promise<CashRegister>

    reopen(businessId: string, turnId: string): Promise<CashRegister>

    close(input: CloseCashRegisterInput): Promise<CashRegister | null>

    getActiveTurnTotals(businessId: string): Promise<CashRegisterTotals>

}