import {
  Banknote,
  FileCheck2,
  FilePlus2,
  FileX2,
  MailCheck,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { getClientById } from "@/lib/mock/clients";
import { getHourEntryMetrics, hourEntries, type HourEntry } from "@/lib/mock/hours";
import { formatCurrency, formatDate } from "@/lib/utils";

export type InvoiceStatus = "borrador" | "emitida" | "pagada" | "vencida" | "anulada";

export type Invoice = {
  id: string;
  numero: string;
  clientId: string;
  concepto: string;
  fechaEmision: string;
  fechaVencimiento: string;
  hourEntryIds: string[];
  subtotal: number;
  iva: number;
  total: number;
  saldoPendiente: number;
  estado: InvoiceStatus;
};

export const IVA_RATE = 0.21;

export function calculateInvoiceAmounts(subtotal: number) {
  const iva = Math.round(subtotal * IVA_RATE);
  return { iva, total: subtotal + iva };
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  borrador: "Borrador",
  emitida: "Emitida",
  pagada: "Pagada",
  vencida: "Vencida",
  anulada: "Anulada",
};

export const invoices: Invoice[] = [
  {
    id: "inv-estudio-beltran-01",
    numero: "A 0003-00141",
    clientId: "estudio-beltran",
    concepto: "Honorarios — Cierre mensual mayo 2026",
    fechaEmision: "2026-06-06",
    fechaVencimiento: "2026-07-06",
    hourEntryIds: ["h1"],
    subtotal: 51000,
    iva: 10710,
    total: 61710,
    saldoPendiente: 0,
    estado: "pagada",
  },
  {
    id: "inv-distribuidora-norte-01",
    numero: "A 0003-00142",
    clientId: "distribuidora-norte",
    concepto: "Honorarios — Conciliación bancaria mayo 2026",
    fechaEmision: "2026-06-09",
    fechaVencimiento: "2026-07-09",
    hourEntryIds: ["h6"],
    subtotal: 39000,
    iva: 8190,
    total: 47190,
    saldoPendiente: 47190,
    estado: "emitida",
  },
  {
    id: "inv-tech-solutions-01",
    numero: "A 0003-00143",
    clientId: "tech-solutions",
    concepto: "Honorarios — Presentación Ganancias 2026",
    fechaEmision: "2026-06-10",
    fechaVencimiento: "2026-06-25",
    hourEntryIds: ["h11"],
    subtotal: 46000,
    iva: 9660,
    total: 55660,
    saldoPendiente: 0,
    estado: "pagada",
  },
  {
    id: "inv-panaderia-del-sol-01",
    numero: "B 0003-00144",
    clientId: "panaderia-del-sol",
    concepto: "Honorarios — Liquidación de sueldos mayo 2026",
    fechaEmision: "2026-06-08",
    fechaVencimiento: "2026-06-18",
    hourEntryIds: ["h15"],
    subtotal: 24800,
    iva: 5208,
    total: 30008,
    saldoPendiente: 0,
    estado: "pagada",
  },
  {
    id: "inv-consultora-vertice-01",
    numero: "A 0003-00145",
    clientId: "consultora-vertice",
    concepto: "Honorarios — Reunión estratégica junio 2026",
    fechaEmision: "2026-06-29",
    fechaVencimiento: "2026-07-14",
    hourEntryIds: ["h20"],
    subtotal: 21000,
    iva: 4410,
    total: 25410,
    saldoPendiente: 25410,
    estado: "emitida",
  },
  {
    id: "inv-grupo-almendra-01",
    numero: "A 0003-00146",
    clientId: "grupo-almendra",
    concepto: "Honorarios — Presentación IVA junio 2026",
    fechaEmision: "2026-06-22",
    fechaVencimiento: "2026-07-07",
    hourEntryIds: ["h26"],
    subtotal: 21600,
    iva: 4536,
    total: 26136,
    saldoPendiente: 26136,
    estado: "emitida",
  },
  {
    id: "inv-comercial-rivas-01",
    numero: "A 0003-00147",
    clientId: "comercial-rivas",
    concepto: "Honorarios — Servicios contables mayo 2026",
    fechaEmision: "2026-05-20",
    fechaVencimiento: "2026-06-19",
    hourEntryIds: [],
    subtotal: 154132,
    iva: 32368,
    total: 186500,
    saldoPendiente: 186500,
    estado: "vencida",
  },
  {
    id: "inv-farmacia-central-01",
    numero: "A 0003-00148",
    clientId: "farmacia-central",
    concepto: "Honorarios — Servicios contables mayo 2026",
    fechaEmision: "2026-05-25",
    fechaVencimiento: "2026-06-24",
    hourEntryIds: [],
    subtotal: 109091,
    iva: 22909,
    total: 132000,
    saldoPendiente: 132000,
    estado: "vencida",
  },
  {
    id: "inv-ferreteria-union-01",
    numero: "B 0003-00149",
    clientId: "ferreteria-union",
    concepto: "Honorarios — Liquidación de sueldos mayo 2026",
    fechaEmision: "2026-06-01",
    fechaVencimiento: "2026-06-16",
    hourEntryIds: [],
    subtotal: 48099,
    iva: 10101,
    total: 58200,
    saldoPendiente: 58200,
    estado: "vencida",
  },
  {
    id: "inv-constructora-del-plata-01",
    numero: "A 0003-00150",
    clientId: "constructora-del-plata",
    concepto: "Honorarios — Auditoría interna junio 2026",
    fechaEmision: "2026-06-23",
    fechaVencimiento: "2026-07-23",
    hourEntryIds: ["h8"],
    subtotal: 76000,
    iva: 15960,
    total: 91960,
    saldoPendiente: 91960,
    estado: "emitida",
  },
  {
    id: "inv-tech-solutions-02",
    numero: "A 0003-00151",
    clientId: "tech-solutions",
    concepto: "Honorarios — Revisión impositiva junio 2026",
    fechaEmision: "",
    fechaVencimiento: "",
    hourEntryIds: ["h25"],
    subtotal: 46000,
    iva: 9660,
    total: 55660,
    saldoPendiente: 0,
    estado: "borrador",
  },
  {
    id: "inv-boutique-aurora-01",
    numero: "B 0003-00152",
    clientId: "boutique-aurora",
    concepto: "Honorarios — Presentación IVA abril 2026",
    fechaEmision: "2026-05-10",
    fechaVencimiento: "2026-05-25",
    hourEntryIds: [],
    subtotal: 27800,
    iva: 5838,
    total: 33638,
    saldoPendiente: 0,
    estado: "anulada",
  },
];

export function getInvoiceById(id: string) {
  return invoices.find((invoice) => invoice.id === id);
}

export function getInvoicesForClient(clientId: string) {
  return invoices.filter((invoice) => invoice.clientId === clientId);
}

export function getInvoiceHourEntries(invoice: Invoice): HourEntry[] {
  return hourEntries.filter((entry) => invoice.hourEntryIds.includes(entry.id));
}

export function summarizeInvoices(list: Invoice[]) {
  return list.reduce(
    (acc, invoice) => {
      if (invoice.estado !== "borrador" && invoice.estado !== "anulada") {
        acc.totalFacturado += invoice.total;
      }
      if (invoice.estado === "emitida") {
        acc.pendienteCobro += invoice.saldoPendiente;
      }
      if (invoice.estado === "vencida") {
        acc.vencido += invoice.saldoPendiente;
      }
      if (invoice.estado === "pagada") {
        acc.cobrado += invoice.total;
      }
      return acc;
    },
    { totalFacturado: 0, pendienteCobro: 0, vencido: 0, cobrado: 0 }
  );
}

export type InvoiceTimelineEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "default" | "success" | "warning" | "danger";
};

export function getInvoiceTimeline(invoice: Invoice): InvoiceTimelineEntry[] {
  const entries: InvoiceTimelineEntry[] = [
    {
      id: "creacion",
      date: invoice.fechaEmision ? formatDate(invoice.fechaEmision) : "Sin emitir",
      title: invoice.estado === "borrador" ? "Borrador creado" : "Factura emitida",
      description:
        invoice.estado === "borrador"
          ? "Comprobante en preparación, todavía no fue enviado al cliente."
          : `Comprobante ${invoice.numero} generado por ${formatCurrency(invoice.total)}.`,
      icon: invoice.estado === "borrador" ? FilePlus2 : Send,
      tone: "default",
    },
  ];

  if (invoice.estado === "pagada") {
    entries.push({
      id: "pago",
      date: "Vencimiento " + formatDate(invoice.fechaVencimiento),
      title: "Pago acreditado",
      description: "Se registró el cobro total del comprobante.",
      icon: Banknote,
      tone: "success",
    });
  } else if (invoice.estado === "vencida") {
    entries.push({
      id: "vencimiento",
      date: formatDate(invoice.fechaVencimiento),
      title: "Venció sin pago registrado",
      description: `Saldo pendiente de ${formatCurrency(invoice.saldoPendiente)}. Requiere seguimiento de cobranza.`,
      icon: FileX2,
      tone: "danger",
    });
  } else if (invoice.estado === "emitida") {
    entries.push({
      id: "envio",
      date: invoice.fechaEmision ? formatDate(invoice.fechaEmision) : "—",
      title: "Enviada al cliente",
      description: `Comprobante enviado por correo. Vence el ${formatDate(invoice.fechaVencimiento)}.`,
      icon: MailCheck,
      tone: "default",
    });
  } else if (invoice.estado === "anulada") {
    entries.push({
      id: "anulacion",
      date: formatDate(invoice.fechaVencimiento),
      title: "Factura anulada",
      description: "El comprobante fue anulado y no genera saldo pendiente.",
      icon: XCircle,
      tone: "warning",
    });
  }

  return entries;
}

export function getInvoiceAiInsights(invoice: Invoice): string[] {
  const insights: string[] = [];
  const client = getClientById(invoice.clientId);
  const clientName = client?.nombreComercial ?? "el cliente";

  if (invoice.estado === "vencida") {
    insights.push(
      `${invoice.numero} está vencida desde el ${formatDate(invoice.fechaVencimiento)}. Se recomienda enviar un recordatorio de pago a ${clientName}.`
    );
  } else if (invoice.estado === "emitida") {
    insights.push(`Vence el ${formatDate(invoice.fechaVencimiento)}. Todavía no se registró un pago.`);
  } else if (invoice.estado === "pagada") {
    insights.push(`${invoice.numero} fue cobrada en su totalidad. Sin acciones pendientes.`);
  } else if (invoice.estado === "borrador") {
    insights.push("Este comprobante todavía no fue emitido. Revisá las horas incluidas antes de enviarlo.");
  } else {
    insights.push("Comprobante anulado. No genera saldo ni requiere seguimiento.");
  }

  const linkedHours = getInvoiceHourEntries(invoice);
  if (linkedHours.length > 0) {
    const totalHoras = linkedHours.reduce((sum, entry) => sum + entry.horas, 0);
    const margen = linkedHours.reduce((sum, entry) => sum + getHourEntryMetrics(entry).margen, 0);
    insights.push(`Incluye ${totalHoras} h trabajadas con un margen estimado de ${formatCurrency(margen)}.`);
  }

  return insights;
}

export const invoiceQuickActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Marcar como pagada", icon: Banknote },
  { label: "Reenviar factura", icon: Send },
  { label: "Descargar PDF", icon: FileCheck2 },
  { label: "Anular factura", icon: XCircle },
];
