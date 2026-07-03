import {
  AlertTriangle,
  BarChart3,
  Clock,
  Clock3,
  DollarSign,
  FileClock,
  FileText,
  ReceiptText,
  Settings,
  TrendingDown,
  UserSquare2,
  Users,
  Wallet,
} from "lucide-react";
import { invoices } from "@/lib/mock/invoices";

export const currentUser = {
  name: "Usuario Demo",
  role: "Administrador",
};

const invoicesPendientes = invoices.filter((invoice) => invoice.estado === "emitida");
const invoicesVencidas = invoices.filter((invoice) => invoice.estado === "vencida");
const facturasPorGestionar = invoicesPendientes.length + invoicesVencidas.length;

export const metrics = [
  {
    label: "Ingresos del mes",
    value: "$1.284.500",
    change: "+12% vs. mes anterior",
    trend: "up" as const,
    icon: DollarSign,
    tone: "success" as const,
  },
  {
    label: "Egresos del mes",
    value: "$742.300",
    change: "+4% vs. mes anterior",
    trend: "down" as const,
    icon: TrendingDown,
    tone: "warning" as const,
  },
  {
    label: "Balance",
    value: "$542.200",
    change: "Saldo positivo",
    trend: "up" as const,
    icon: Wallet,
    tone: "success" as const,
  },
  {
    label: "Facturas pendientes",
    value: String(facturasPorGestionar),
    change: `${invoicesVencidas.length} vencidas requieren gestión`,
    trend: "neutral" as const,
    icon: FileClock,
    tone: "default" as const,
  },
];

export const alerts = [
  {
    id: "mora",
    title: "5 clientes en mora",
    description: "Superaron los 30 días sin registrar pagos",
    variant: "danger" as const,
    icon: AlertTriangle,
  },
  {
    id: "facturas-vencidas",
    title: `${invoicesVencidas.length} facturas vencidas`,
    description: "Requieren seguimiento de cobro esta semana",
    variant: "warning" as const,
    icon: FileClock,
  },
  {
    id: "comprobantes",
    title: "4 comprobantes nuevos",
    description: "Cargados por clientes, pendientes de validación",
    variant: "info" as const,
    icon: ReceiptText,
  },
];

export const suggestedTasks = [
  {
    id: "horas",
    title: "Cargar horas pendientes",
    description: "Hay 12 horas del equipo sin registrar en la semana actual.",
    icon: Clock,
    cta: "Cargar horas",
    urgent: false,
  },
  {
    id: "recordatorios",
    title: "Enviar recordatorios de pago",
    description: "5 clientes en mora todavía no recibieron un recordatorio.",
    icon: AlertTriangle,
    cta: "Enviar recordatorio",
    urgent: true,
  },
  {
    id: "validar-comprobantes",
    title: "Validar comprobantes nuevos",
    description: "4 comprobantes cargados por clientes esperan revisión contable.",
    icon: ReceiptText,
    cta: "Revisar comprobantes",
    urgent: false,
  },
];

export const recentActivity = [
  {
    id: 1,
    icon: Wallet,
    title: "Cobro registrado — Estudio Beltrán SRL",
    meta: "$85.000 acreditados por transferencia",
    time: "Hace 15 min",
    tone: "success" as const,
  },
  {
    id: 2,
    icon: ReceiptText,
    title: "Nuevo comprobante — Distribuidora Norte",
    meta: "Factura A 0003-00142 cargada",
    time: "Hace 1 h",
    tone: "default" as const,
  },
  {
    id: 3,
    icon: AlertTriangle,
    title: "Cliente pasó a mora — Comercial Rivas",
    meta: "32 días sin registrar pagos",
    time: "Hace 3 h",
    tone: "danger" as const,
  },
  {
    id: 4,
    icon: Wallet,
    title: "Cobro registrado — Tech Solutions SA",
    meta: "$210.000 acreditados por transferencia",
    time: "Ayer",
    tone: "success" as const,
  },
  {
    id: 5,
    icon: FileText,
    title: "Factura pagada — Panadería Del Sol",
    meta: "Factura B 0003-00144 por $30.008",
    time: "Ayer",
    tone: "default" as const,
  },
];

export const aiSuggestions = [
  { text: "3 clientes superaron los 30 días de mora: considerá enviar un recordatorio automático." },
  { text: "Los egresos crecieron 4% este mes. Revisá los rubros de mayor variación en Reportes." },
  { text: "Quedan 12 horas del equipo sin cargar. Cerrá la semana antes del viernes para no atrasar la facturación." },
];

export const quickAccess = [
  {
    label: "Clientes",
    description: "Cartera y estado de cuenta",
    href: "/clients",
    icon: Users,
    enabled: true,
  },
  {
    label: "Facturación",
    description: "Comprobantes y cobros",
    href: "/invoices",
    icon: FileText,
    enabled: true,
  },
  {
    label: "Empleados",
    description: "Legajos y horas",
    href: "/employees",
    icon: UserSquare2,
    enabled: true,
  },
  {
    label: "Horas",
    description: "Registro de horas trabajadas",
    href: "/hours",
    icon: Clock3,
    enabled: true,
  },
  {
    label: "Reportes",
    description: "Indicadores y balances",
    href: "/reports",
    icon: BarChart3,
    enabled: true,
  },
  {
    label: "Configuración",
    description: "Preferencias del sistema",
    href: "/configuracion",
    icon: Settings,
    enabled: false,
  },
];
