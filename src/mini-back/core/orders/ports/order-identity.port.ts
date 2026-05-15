export interface OrderIdentityPort {

  getNextDailyNumber(
    origin: "BUSINESS" | "APP"
  ): Promise<number>;
}