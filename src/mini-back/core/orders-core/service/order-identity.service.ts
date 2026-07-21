import { OrderIdentityPort } from "../ports/order-identity.port";

export class OrderIdentityService {
  constructor(private readonly identityPort: OrderIdentityPort) {}

  async generate(origin: "BUSINESS" | "APP") {
    const nextNumber = await this.identityPort.getNextDailyNumber(origin);

    const shortCode = this.formatShortCode(nextNumber, origin);

    return {
      nextNumber,
      shortCode,
    };
  }

  private formatShortCode(number: number, origin: "BUSINESS" | "APP"): string {
    const prefix = origin === "BUSINESS" ? "P" : "A";

    return `${prefix}-${number}`;
  }
}
