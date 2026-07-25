export interface CashRegisterPort {
    findActive(businessId: string): Promise<{clientTurnId:string, id:string | null} | null>;
}