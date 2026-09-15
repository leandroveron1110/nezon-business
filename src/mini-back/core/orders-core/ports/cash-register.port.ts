export interface CashRegisterPort {
    findActive(businessId: string): Promise<{idTemp:string, id:string | null} | null>;
}