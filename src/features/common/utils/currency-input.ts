export function formatCurrencyInput(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (!numbers) return "";

  return Number(numbers).toLocaleString("es-AR");
}

export function parseCurrencyInput(value: string) {
  return Number(value.replace(/\./g, ""));
}