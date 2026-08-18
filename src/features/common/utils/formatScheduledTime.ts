interface FormatTimeRemainingOptions {
  targetDate: string | Date | number | null | undefined;
  now?: number;

  /**
   * true  = targetDate representa cuándo quiere el cliente el pedido.
   * false = targetDate representa cuándo se creó/registró el pedido.
   */
  isScheduled?: boolean;
}

export interface FormattedTimeResult {
  display: string;
  diffMinutes: number;
  absMinutes: number;
  isSameDay: boolean;
  isLate: boolean;
  isUrgent: boolean;
}

export function formatTimeRemaining({
  targetDate,
  now = Date.now(),
  isScheduled = true,
}: FormatTimeRemainingOptions): FormattedTimeResult {
  // ============================================================
  // SIN FECHA
  // ============================================================

  if (!targetDate) {
    return {
      display: "--:--",
      diffMinutes: 0,
      absMinutes: 0,
      isSameDay: false,
      isLate: false,
      isUrgent: false,
    };
  }

  const target = new Date(targetDate);
  const current = new Date(now);

  // ============================================================
  // DIFERENCIA
  // ============================================================

  const diffMs = target.getTime() - current.getTime();
  const rawDiffMinutes = Math.floor(diffMs / 60000);
  const absMinutes = Math.abs(rawDiffMinutes);

  // ============================================================
  // MISMO DÍA
  // ============================================================

  const isSameDay =
    target.getDate() === current.getDate() &&
    target.getMonth() === current.getMonth() &&
    target.getFullYear() === current.getFullYear();

  // ============================================================
  // HORA / FECHA
  // ============================================================

  const timeStr = target.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateStr = target.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });

  // ============================================================
  // CASO A
  // PEDIDO NORMAL
  //
  // targetDate = createdAt
  //
  // Siempre contamos HACIA ADELANTE:
  //
  // ahora 20:30
  // creado 20:00
  //
  // => 30'
  // ============================================================

  if (!isScheduled) {
    const elapsedMinutes = Math.max(0, -rawDiffMinutes);

    // Si es otro día, mostramos fecha + hora.
    if (!isSameDay || elapsedMinutes >= 1440) {
      return {
        display: `${dateStr} · ${timeStr}`,
        diffMinutes: elapsedMinutes,
        absMinutes: elapsedMinutes,
        isSameDay: false,
        isLate: false,
        isUrgent: elapsedMinutes >= 25,
      };
    }

    // Menos de una hora.
    if (elapsedMinutes < 60) {
      return {
        display: `${elapsedMinutes}'`,
        diffMinutes: elapsedMinutes,
        absMinutes: elapsedMinutes,
        isSameDay: true,
        isLate: false,
        isUrgent: elapsedMinutes >= 25,
      };
    }

    // Una hora o más.
    const hours = Math.floor(elapsedMinutes / 60);
    const minutes = elapsedMinutes % 60;

    const elapsedText =
      minutes > 0
        ? `${hours}h ${minutes}m`
        : `${hours}h`;

    return {
      display: elapsedText,
      diffMinutes: elapsedMinutes,
      absMinutes: elapsedMinutes,
      isSameDay: true,
      isLate: false,
      isUrgent: elapsedMinutes >= 25,
    };
  }

  // ============================================================
  // CASO B
  // PEDIDO PROGRAMADO
  //
  // targetDate = scheduledAt
  //
  // Futuro:
  //   -20m
  //
  // Pasado:
  //   +20m
  // ============================================================

  const isLate = rawDiffMinutes < 0;

  // ============================================================
  // OTRO DÍA
  // ============================================================

  if (!isSameDay || absMinutes >= 1440) {
    return {
      display: `${dateStr} · ${timeStr}`,
      diffMinutes: rawDiffMinutes,
      absMinutes,
      isSameDay: false,
      isLate,
      isUrgent: false,
    };
  }

  // ============================================================
  // MISMO DÍA
  // 60 MINUTOS O MÁS
  // ============================================================

  if (absMinutes >= 60) {
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;

    const duration =
      minutes > 0
        ? `${hours}h ${minutes}m`
        : `${hours}h`;

    const prefix = isLate ? "+" : "-";

    return {
      display: `${prefix}${duration} · ${timeStr}`,
      diffMinutes: rawDiffMinutes,
      absMinutes,
      isSameDay: true,
      isLate,
      isUrgent: !isLate && absMinutes <= 15,
    };
  }

  // ============================================================
  // MISMO DÍA
  // MENOS DE 60 MINUTOS
  // ============================================================

  let display: string;

  if (rawDiffMinutes > 0) {
    // Todavía falta.
    display = `-${rawDiffMinutes}m · ${timeStr}`;
  } else if (rawDiffMinutes === 0) {
    // Llegó la hora.
    display = `AHORA · ${timeStr}`;
  } else {
    // Ya pasó la hora.
    display = `+${absMinutes}m · ${timeStr}`;
  }

  return {
    display,
    diffMinutes: rawDiffMinutes,
    absMinutes,
    isSameDay: true,
    isLate,
    isUrgent: !isLate && absMinutes <= 15,
  };
}