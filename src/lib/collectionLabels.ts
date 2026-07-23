// Labels de presentación para el estado de cobranza (Sprint 8.7C.1). Vive
// fuera de src/lib/data/collections.ts a propósito: ese archivo importa
// "server-only" y no puede cargarse desde un componente cliente
// (CollectionsView, ClientCollectionCard) — mismo criterio que
// src/lib/paymentMethods.ts para PaymentMethod.
//
// Estos tres tipos son deliberadamente distintos de InvoiceStatus
// (src/lib/mock/invoices.ts): el estado financiero de una factura
// (emitida/parcial/vencida/pagada) y su estado de cobranza (al día/por
// vencer/vencida/crítica) son dos ejes independientes — ver la nota de
// diseño en src/lib/data/collections.ts.
export type CollectionStatus = "al-dia" | "por-vencer" | "vencida" | "critica";

export const collectionStatusLabels: Record<CollectionStatus, string> = {
  "al-dia": "Al día",
  "por-vencer": "Por vencer",
  vencida: "Vencida",
  critica: "Crítica",
};

export type CollectionPriority = "alta" | "media" | "baja";

export const collectionPriorityLabels: Record<CollectionPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export type SuggestedChannel = "llamada" | "whatsapp" | "email";

export const suggestedChannelLabels: Record<SuggestedChannel, string> = {
  llamada: "Llamada telefónica",
  whatsapp: "WhatsApp",
  email: "Email",
};
