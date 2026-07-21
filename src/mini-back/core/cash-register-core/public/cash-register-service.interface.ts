import { CloseCashRegisterInput } from "../input/close.input";
import { InitializeCashRegisterInput } from "../input/initialize.input";
import { OpenCashRegisterInput } from "../input/open.input";
import { CashRegisterClosedSignal } from "../signal/cash-register-closed.signal";

export interface ICashRegisterPublicService {

    initialize(
        input: InitializeCashRegisterInput
    ): Promise<CashRegisterClosedSignal>;

    open(
        input: OpenCashRegisterInput
    ): Promise<CashRegisterClosedSignal>;

    close(
        input: CloseCashRegisterInput
    ): Promise<CashRegisterClosedSignal>;

    calculateSummary(
        businessId: string
    ): Promise<CashRegisterClosedSignal>;

    calculateClosingAmount(
        businessId: string
    ): Promise<CashRegisterClosedSignal>;

}