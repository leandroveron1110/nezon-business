
/* ============================================================================
   DATE RANGE
============================================================================ */
export type SalesPeriod = "today" | "yesterday" | "week" | "month" | "custom";

export function getSalesPeriodRange(period: Exclude<SalesPeriod, "custom">): {
  from: Date;
  to: Date;
} {
  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (period) {
    case "yesterday": {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 1);

      const to = new Date(todayEnd);
      to.setDate(to.getDate() - 1);

      return {
        from,
        to,
      };
    }

    case "week": {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 6);

      return {
        from,
        to: todayEnd,
      };
    }

    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      return {
        from,
        to: todayEnd,
      };
    }

    case "today":
    default:
      return {
        from: todayStart,
        to: todayEnd,
      };
  }
}

/* ============================================================================
   FORMATTERS
============================================================================ */

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }

  return `$${value}`;
}

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    CARD: "Tarjeta",
    MERCADO_PAGO: "Mercado Pago",
  };

  return (
    labels[value] ??
    value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function formatOrderType(value: string) {
  const labels: Record<string, string> = {
    DELIVERY: "Delivery",
    TAKEAWAY: "Para llevar",
    DINE_IN: "Salón",
    PICKUP: "Retiro",
  };

  return (
    labels[value] ??
    value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
