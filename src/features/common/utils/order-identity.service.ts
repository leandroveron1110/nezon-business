import { db } from "@/mini-back/infrastructure/dexie/db";

export class OrderIdentityService {
  /**
   * Calcula el próximo número diario basado en el máximo existente.
   * Esto evita que si se borra una orden, el número se repita.
   */
  static async getNextDailyNumber(origin: "BUSINESS" | "APP"): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const lastOrder = await db.orders
      .where("createdAt")
      .above(startOfDay)
      .filter((o) => o.origin === origin)
      .reverse()
      .first();

    return (lastOrder?.dailyNumber ?? 0) + 1;
  }

  /**
   * Genera el código humano (P-1, A-5)
   */
  static formatShortCode(number: number, origin: "BUSINESS" | "APP"): string {
    const prefix = origin === "BUSINESS" ? "P" : "A";
    return `${prefix}-${number}`;
  }
}