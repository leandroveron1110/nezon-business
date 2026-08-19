import { SalesCashQueryPort } from "@/mini-back/core/admin-core/port/sales/sales-cash-query.port";
import { db } from "../../../db";

export class SalesCashRepository implements SalesCashQueryPort {
  /**
   * Resumen financiero de ventas.
   *
   * La fuente de verdad es financialMovement.
   *
   * SALE    -> dinero efectivamente cobrado.
   * REFUND  -> dinero efectivamente devuelto.
   */
  async getSalesSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<{
    totalSales: number;
    totalRefunds: number;
  }> {
    let totalSales = 0;
    let totalRefunds = 0;

    await db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          (movement.type === "SALE" || movement.type === "REFUND"),
      )
      .each((movement) => {
        if (movement.type === "SALE") {
          totalSales += movement.amount;
        }

        if (movement.type === "REFUND") {
          totalRefunds += movement.amount;
        }
      });

    return {
      totalSales,
      totalRefunds,
    };
  }

  /**
   * Evolución de ventas por día.
   *
   * Solo dinero efectivamente cobrado.
   */
  async getSalesEvolution(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      date: Date;
      amount: number;
    }[]
  > {
    const evolutionMap = new Map<string, number>();

    await db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          movement.type === "SALE",
      )
      .each((movement) => {
        const date = new Date(movement.date);

        const dateKey = this.formatDateKey(date);

        const current = evolutionMap.get(dateKey) ?? 0;

        evolutionMap.set(dateKey, current + movement.amount);
      });

    return Array.from(evolutionMap.entries())
      .map(([dateKey, amount]) => {
        const [year, month, day] = dateKey.split("-").map(Number);

        return {
          date: new Date(year, month - 1, day),
          amount,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Ventas agrupadas por hora.
   *
   * La hora corresponde al movimiento financiero,
   * no a la creación de la orden.
   */
  async getSalesByHour(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      hour: number;
      amount: number;
    }[]
  > {
    const hourMap = new Map<number, number>();

    await db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          movement.type === "SALE",
      )
      .each((movement) => {
        const date = new Date(movement.date);
        const hour = date.getHours();

        const current = hourMap.get(hour) ?? 0;

        hourMap.set(hour, current + movement.amount);
      });

    return Array.from(hourMap.entries())
      .map(([hour, amount]) => ({
        hour,
        amount,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Ventas agrupadas por método de pago.
   */
  async getPaymentMethodSummary(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      paymentMethod: string;
      amount: number;
    }[]
  > {
    const paymentMap = new Map<string, number>();

    await db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (movement) =>
          movement.businessId === businessId &&
          movement.status === "CONFIRMED" &&
          movement.type === "SALE",
      )
      .each((movement) => {
        const paymentMethod = movement.paymentMethod;
        if(paymentMethod) {

          const current = paymentMap.get(paymentMethod) ?? 0;
  
          paymentMap.set(paymentMethod, current + movement.amount);
        }

      });

    return Array.from(paymentMap.entries())
      .map(([paymentMethod, amount]) => ({
        paymentMethod,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Volumen de ventas por caja.
   *
   * La información monetaria proviene
   * exclusivamente de financialMovement.
   */
  // Si movement contiene el id de la sesión de caja (ej. sessionId / cashRegisterSessionId)
  async getSalesByCashRegister(
    businessId: string,
    from: Date,
    to: Date,
  ): Promise<
    {
      cashRegisterId: string;
      cashRegisterName: string; // Ejemplo: "Caja 1 (08:00 hs - 16:30 hs)" o "Turno Mañana (08:00 - 16:30)"
      amount: number;
    }[]
  > {
    // 1. Obtener los movimientos filtrados
    const movements = await db.financialMovement
      .where("date")
      .between(from, to, true, true)
      .filter(
        (m) =>
          m.businessId === businessId &&
          m.status === "CONFIRMED" &&
          m.type === "SALE",
      )
      .toArray();

    if (movements.length === 0) return [];

    // 2. Obtener los IDs de las sesiones/cajas involucradas
    const sessionIds = Array.from(
      new Set(movements.map((m) => m.cashRegisterTurnIdTemp /* o idTemp */)),
    );

    // 3. Consultar los datos de apertura/cierre de esas sesiones
    const sessions = await db.cashRegisterTurn
      .where("clientTurnId")
      .anyOf(sessionIds)
      .toArray();

    const sessionMap = new Map(sessions.map((s) => [s.clientTurnId, s]));

    // 4. Agrupar montos y formatear el rango horario
    const cashRegisterMap = new Map<
      string,
      { cashRegisterName: string; amount: number }
    >();

    for (const movement of movements) {
      const sessionId = movement.cashRegisterTurnIdTemp;
      const session = sessionMap.get(sessionId);

      console.log(sessionId, session);
      const label = session
        ? this.formatSessionLabel({
            openedAt: session.openingDate,
            closedAt: session.closingDate,
            registerName: session.openingNotes, // o session.registerName si existe
          })
        : `Caja`;

      const existing = cashRegisterMap.get(sessionId) ?? {
        cashRegisterName: label,
        amount: 0,
      };

      cashRegisterMap.set(sessionId, {
        cashRegisterName: existing.cashRegisterName,
        amount: existing.amount + movement.amount,
      });
    }

    return Array.from(cashRegisterMap.entries())
      .map(([cashRegisterId, data]) => ({
        cashRegisterId,
        cashRegisterName: data.cashRegisterName,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private formatSessionLabel(session: {
    openedAt: Date;
    closedAt?: Date | null;
    registerName?: string;
  }): string {
    const openTime = this.formatTime(new Date(session.openedAt));
    const closeTime = session.closedAt
      ? this.formatTime(new Date(session.closedAt))
      : "Abierta";

    const baseName = session.registerName ?? "Caja";

    return `${baseName} (${openTime} - ${closeTime})`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} hs`;
  }

  // ============================================================
  // AUXILIAR
  // ============================================================

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
