export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString("es-AR")}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(value));
}
