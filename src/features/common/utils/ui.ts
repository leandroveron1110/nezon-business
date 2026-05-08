/**
 * UI TOKENS - Locus Digital Platform
 * Centralización de colores para mantener coherencia entre alertas, badges y estados.
 */

export const UI_COLORS = {
  // ÉXITO: Pagos confirmados, pedidos listos, acciones correctas
  SUCCESS: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    main: "bg-emerald-600",
    border: "border-emerald-200",
  },
  // ERROR / PELIGRO: Tiempo crítico, errores de red, pedido cancelado
  ERROR: {
    bg: "bg-red-100",
    text: "text-red-800",
    main: "bg-red-600",
    border: "border-red-200",
  },
  // ADVERTENCIA / PENDIENTE: Pago pendiente, tiempo de espera medio
  WARNING: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    main: "bg-orange-500",
    border: "border-orange-200",
  },
  // INFO / LOGÍSTICA: Delivery, alertas informativas, App orders
  INFO: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    main: "bg-blue-600",
    border: "border-blue-200",
  },
  // ESPECIAL: Retiro en local (Pickup) para diferenciar del azul informativo
PICKUP: {
    bg: "bg-fuchsia-100",      // Rosa suave de fondo
    text: "text-fuchsia-800",   // Texto oscuro legible
    main: "bg-fuchsia-500",    // La barra lateral que se ve de lejos
    border: "border-fuchsia-200",
  }
} as const;