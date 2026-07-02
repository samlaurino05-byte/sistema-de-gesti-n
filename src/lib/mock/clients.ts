import {
  AlertTriangle,
  Banknote,
  CalendarPlus,
  FileCheck2,
  Mail,
  MessageSquareText,
  PauseCircle,
  Phone,
  ReceiptText,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export type ClientStatus = "activo" | "mora" | "pausado" | "inactivo";

export type Client = {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  cuit: string;
  condicionFiscal: string;
  email: string;
  telefono: string;
  responsableInterno: string;
  estado: ClientStatus;
  condicionPago: string;
  valorHora: number;
  deudaPendiente: number;
  facturacionMensual: number;
  fechaAlta: string;
};

export const clients: Client[] = [
  {
    id: "estudio-beltran",
    razonSocial: "Estudio Beltrán SRL",
    nombreComercial: "Estudio Beltrán",
    cuit: "30-71234567-9",
    condicionFiscal: "Responsable Inscripto",
    email: "administracion@beltransrl.com.ar",
    telefono: "+54 11 4567-1234",
    responsableInterno: "Marina López",
    estado: "activo",
    condicionPago: "30 días",
    valorHora: 8500,
    deudaPendiente: 0,
    facturacionMensual: 320000,
    fechaAlta: "2022-03-14",
  },
  {
    id: "distribuidora-norte",
    razonSocial: "Distribuidora Norte SA",
    nombreComercial: "Distribuidora Norte",
    cuit: "30-70123456-4",
    condicionFiscal: "Responsable Inscripto",
    email: "contacto@distribuidoranorte.com.ar",
    telefono: "+54 11 4789-2233",
    responsableInterno: "Diego Fernández",
    estado: "activo",
    condicionPago: "Cuenta corriente",
    valorHora: 7800,
    deudaPendiente: 45000,
    facturacionMensual: 410000,
    fechaAlta: "2021-08-02",
  },
  {
    id: "tech-solutions",
    razonSocial: "Tech Solutions SA",
    nombreComercial: "Tech Solutions",
    cuit: "30-69876543-1",
    condicionFiscal: "Responsable Inscripto",
    email: "finanzas@techsolutions.com.ar",
    telefono: "+54 11 4321-5566",
    responsableInterno: "Julieta Ibarra",
    estado: "activo",
    condicionPago: "15 días",
    valorHora: 9200,
    deudaPendiente: 0,
    facturacionMensual: 560000,
    fechaAlta: "2020-11-20",
  },
  {
    id: "panaderia-del-sol",
    razonSocial: "Panadería Del Sol S.H.",
    nombreComercial: "Panadería Del Sol",
    cuit: "30-68123987-2",
    condicionFiscal: "Monotributo",
    email: "panaderiadelsol@gmail.com",
    telefono: "+54 11 4455-7788",
    responsableInterno: "Nicolás Paz",
    estado: "activo",
    condicionPago: "Contado",
    valorHora: 6200,
    deudaPendiente: 0,
    facturacionMensual: 95000,
    fechaAlta: "2023-01-10",
  },
  {
    id: "comercial-rivas",
    razonSocial: "Comercial Rivas SRL",
    nombreComercial: "Comercial Rivas",
    cuit: "30-70456789-3",
    condicionFiscal: "Responsable Inscripto",
    email: "pagos@comercialrivas.com.ar",
    telefono: "+54 11 4988-1122",
    responsableInterno: "Marina López",
    estado: "mora",
    condicionPago: "30 días",
    valorHora: 7500,
    deudaPendiente: 186500,
    facturacionMensual: 260000,
    fechaAlta: "2019-05-27",
  },
  {
    id: "farmacia-central",
    razonSocial: "Farmacia Central SA",
    nombreComercial: "Farmacia Central",
    cuit: "30-71987654-0",
    condicionFiscal: "Responsable Inscripto",
    email: "administracion@farmaciacentral.com.ar",
    telefono: "+54 11 4322-9090",
    responsableInterno: "Diego Fernández",
    estado: "mora",
    condicionPago: "30 días",
    valorHora: 8000,
    deudaPendiente: 132000,
    facturacionMensual: 210000,
    fechaAlta: "2022-06-18",
  },
  {
    id: "ferreteria-union",
    razonSocial: "Ferretería Unión S.H.",
    nombreComercial: "Ferretería Unión",
    cuit: "30-69234561-7",
    condicionFiscal: "Monotributo",
    email: "ferreteriaunion@hotmail.com",
    telefono: "+54 11 4677-3344",
    responsableInterno: "Nicolás Paz",
    estado: "mora",
    condicionPago: "15 días",
    valorHora: 6500,
    deudaPendiente: 58200,
    facturacionMensual: 78000,
    fechaAlta: "2023-09-05",
  },
  {
    id: "grupo-almendra",
    razonSocial: "Grupo Almendra SRL",
    nombreComercial: "Grupo Almendra",
    cuit: "30-70765432-8",
    condicionFiscal: "Responsable Inscripto",
    email: "info@grupoalmendra.com.ar",
    telefono: "+54 11 4900-4455",
    responsableInterno: "Julieta Ibarra",
    estado: "pausado",
    condicionPago: "30 días",
    valorHora: 7200,
    deudaPendiente: 12000,
    facturacionMensual: 0,
    fechaAlta: "2021-02-11",
  },
  {
    id: "boutique-aurora",
    razonSocial: "Boutique Aurora S.H.",
    nombreComercial: "Boutique Aurora",
    cuit: "30-69345612-9",
    condicionFiscal: "Monotributo",
    email: "aurora.boutique@gmail.com",
    telefono: "+54 11 4233-6677",
    responsableInterno: "Marina López",
    estado: "pausado",
    condicionPago: "Contado",
    valorHora: 5800,
    deudaPendiente: 0,
    facturacionMensual: 0,
    fechaAlta: "2022-10-30",
  },
  {
    id: "constructora-del-plata",
    razonSocial: "Constructora del Plata SA",
    nombreComercial: "Constructora del Plata",
    cuit: "30-71345698-6",
    condicionFiscal: "Responsable Inscripto",
    email: "administracion@constructoradelplata.com.ar",
    telefono: "+54 11 4788-9911",
    responsableInterno: "Diego Fernández",
    estado: "activo",
    condicionPago: "Cuenta corriente",
    valorHora: 9500,
    deudaPendiente: 96000,
    facturacionMensual: 890000,
    fechaAlta: "2018-04-23",
  },
  {
    id: "libreria-horizonte",
    razonSocial: "Librería Horizonte S.H.",
    nombreComercial: "Librería Horizonte",
    cuit: "30-68456789-5",
    condicionFiscal: "Monotributo",
    email: "libreriahorizonte@gmail.com",
    telefono: "+54 11 4566-2211",
    responsableInterno: "Nicolás Paz",
    estado: "inactivo",
    condicionPago: "Contado",
    valorHora: 5500,
    deudaPendiente: 0,
    facturacionMensual: 0,
    fechaAlta: "2020-07-08",
  },
  {
    id: "consultora-vertice",
    razonSocial: "Consultora Vértice SRL",
    nombreComercial: "Consultora Vértice",
    cuit: "30-70987123-2",
    condicionFiscal: "Responsable Inscripto",
    email: "contacto@consultoravertice.com.ar",
    telefono: "+54 11 4321-8899",
    responsableInterno: "Julieta Ibarra",
    estado: "activo",
    condicionPago: "15 días",
    valorHora: 10500,
    deudaPendiente: 0,
    facturacionMensual: 480000,
    fechaAlta: "2022-01-17",
  },
];

export function getClientById(id: string) {
  return clients.find((client) => client.id === id);
}

export const statusLabels: Record<ClientStatus, string> = {
  activo: "Activo",
  mora: "En mora",
  pausado: "Pausado",
  inactivo: "Inactivo",
};

export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "default" | "success" | "warning" | "danger";
};

export function getClientTimeline(client: Client): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      id: "alta",
      date: formatDate(client.fechaAlta),
      title: "Alta como cliente",
      description: `Incorporado a la cartera con condición de pago "${client.condicionPago}".`,
      icon: UserPlus,
      tone: "default",
    },
    {
      id: "factura",
      date: "Hace 4 días",
      title: "Factura emitida",
      description: `Comprobante generado por ${formatCurrency(client.facturacionMensual)} correspondiente al mes en curso.`,
      icon: ReceiptText,
      tone: "default",
    },
  ];

  if (client.deudaPendiente > 0) {
    entries.push({
      id: "deuda",
      date: "Hace 2 días",
      title: "Saldo pendiente detectado",
      description: `Deuda acumulada de ${formatCurrency(client.deudaPendiente)} sin acreditar.`,
      icon: AlertTriangle,
      tone: "warning",
    });
  }

  if (client.estado === "mora") {
    entries.push({
      id: "mora",
      date: "Ayer",
      title: "Pasó a estado en mora",
      description: "Superó los 30 días sin registrar pagos. Requiere seguimiento de cobranza.",
      icon: AlertTriangle,
      tone: "danger",
    });
  } else if (client.estado === "pausado") {
    entries.push({
      id: "pausado",
      date: "Hace 1 semana",
      title: "Cuenta pausada",
      description: "El cliente solicitó pausar el servicio de manera temporal.",
      icon: PauseCircle,
      tone: "warning",
    });
  } else {
    entries.push({
      id: "pago",
      date: "Ayer",
      title: "Pago registrado",
      description: "Se acreditó el pago del último comprobante emitido.",
      icon: Banknote,
      tone: "success",
    });
  }

  return entries;
}

export type ClientDocument = {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
};

export function getClientDocuments(client: Client): ClientDocument[] {
  return [
    {
      id: "contrato",
      name: `Contrato de servicios — ${client.nombreComercial}.pdf`,
      type: "Contrato",
      date: new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(client.fechaAlta)),
      size: "312 KB",
    },
    {
      id: "factura-reciente",
      name: "Última factura emitida.pdf",
      type: "Factura",
      date: "Hace 4 días",
      size: "128 KB",
    },
    {
      id: "constancia",
      name: "Constancia de inscripción AFIP.pdf",
      type: "Constancia fiscal",
      date: "Hace 3 meses",
      size: "204 KB",
    },
  ];
}

export type ClientCommunication = {
  id: string;
  channel: "email" | "llamada" | "mensaje";
  subject: string;
  summary: string;
  date: string;
  icon: LucideIcon;
};

export function getClientCommunications(client: Client): ClientCommunication[] {
  const base: ClientCommunication[] = [
    {
      id: "comm-1",
      channel: "email",
      subject: "Envío de factura mensual",
      summary: `Se envió el comprobante correspondiente a ${client.nombreComercial}.`,
      date: "Hace 4 días",
      icon: Mail,
    },
    {
      id: "comm-2",
      channel: "llamada",
      subject: "Consulta sobre condición de pago",
      summary: "Llamada de seguimiento con el responsable de administración.",
      date: "Hace 1 semana",
      icon: Phone,
    },
  ];

  if (client.deudaPendiente > 0) {
    base.unshift({
      id: "comm-0",
      channel: "mensaje",
      subject: "Recordatorio de pago pendiente",
      summary: `Se notificó saldo pendiente de ${formatCurrency(client.deudaPendiente)}.`,
      date: "Ayer",
      icon: MessageSquareText,
    });
  }

  return base;
}

export function getClientAiInsights(client: Client): string[] {
  const insights: string[] = [];

  if (client.estado === "mora") {
    insights.push(
      `${client.nombreComercial} superó los días de gracia con una deuda de ${formatCurrency(client.deudaPendiente)}. Se recomienda enviar un recordatorio de pago.`
    );
  } else if (client.deudaPendiente > 0) {
    insights.push(
      `Hay un saldo de ${formatCurrency(client.deudaPendiente)} sin acreditar. Podés generar un recordatorio antes del vencimiento.`
    );
  } else {
    insights.push(`${client.nombreComercial} no registra saldos pendientes. Buen historial de pagos.`);
  }

  if (client.estado === "pausado") {
    insights.push("La cuenta está pausada. Considerá contactar al responsable para reactivar el servicio.");
  } else if (client.estado === "inactivo") {
    insights.push("El cliente está inactivo hace tiempo. Evaluá si corresponde dar de baja la cuenta.");
  } else {
    insights.push(`Factura mensual promedio de ${formatCurrency(client.facturacionMensual)}, en línea con el histórico.`);
  }

  return insights;
}

export const quickActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Registrar pago", icon: Banknote },
  { label: "Enviar recordatorio", icon: MessageSquareText },
  { label: "Generar factura", icon: FileCheck2 },
  { label: "Agendar reunión", icon: CalendarPlus },
];
