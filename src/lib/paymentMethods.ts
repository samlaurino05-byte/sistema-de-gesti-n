import { PaymentMethod } from "@/generated/prisma/enums";

// Labels de presentación para PaymentMethod (Sprint 8.7B.2). Vive fuera de
// src/lib/data/payments.ts a propósito: ese archivo importa "server-only" y
// no puede cargarse desde un componente cliente (el formulario de
// Registrar pago). Este módulo solo reexporta el enum real del schema con
// sus etiquetas — no se inventa ningún medio de pago nuevo.
export const paymentMethodOrder: PaymentMethod[] = [
  PaymentMethod.TRANSFERENCIA,
  PaymentMethod.EFECTIVO,
  PaymentMethod.CHEQUE,
  PaymentMethod.TARJETA,
  PaymentMethod.OTRO,
];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.TRANSFERENCIA]: "Transferencia",
  [PaymentMethod.EFECTIVO]: "Efectivo",
  [PaymentMethod.CHEQUE]: "Cheque",
  [PaymentMethod.TARJETA]: "Tarjeta",
  [PaymentMethod.OTRO]: "Otro",
};
