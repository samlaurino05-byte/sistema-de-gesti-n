import { invoices } from "@/lib/mock/invoices";

export type StudioProfile = {
  nombre: string;
  razonSocial: string;
  cuit: string;
  email: string;
  telefono: string;
  direccion: string;
  localidad: string;
  provincia: string;
  logoInitials: string;
};

export const studioProfile: StudioProfile = {
  nombre: "Estudio Méndez & Asociados",
  razonSocial: "Méndez & Asociados SRL",
  cuit: "30-71122334-5",
  email: "administracion@estudiomendez.com.ar",
  telefono: "+54 11 4900-1200",
  direccion: "Av. Santa Fe 2100, Piso 4",
  localidad: "CABA",
  provincia: "Buenos Aires",
  logoInitials: "MA",
};

export type UserRole = "administrador" | "contador" | "supervisor" | "colaborador";

export const userRoleLabels: Record<UserRole, string> = {
  administrador: "Administrador",
  supervisor: "Supervisor",
  contador: "Contador",
  colaborador: "Colaborador",
};

export const userRoleDescriptions: Record<UserRole, string> = {
  administrador: "Acceso total: gestiona usuarios, permisos, parámetros de facturación y configuración del estudio.",
  supervisor: "Supervisa clientes, facturación y horas del equipo; aprueba y corrige cargas. Sin acceso a configuración.",
  contador: "Gestiona clientes, facturación, cobranzas y horas del día a día. Sin acceso a empleados ni configuración.",
  colaborador: "Carga sus propias horas y consulta clientes y facturas asignadas. Acceso mínimo de solo lectura.",
};

export type UserStatus = "activo" | "invitacion_pendiente" | "inactivo";

export const userStatusLabels: Record<UserStatus, string> = {
  activo: "Activo",
  invitacion_pendiente: "Invitación pendiente",
  inactivo: "Inactivo",
};

export type SystemUser = {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: UserStatus;
  ultimoAcceso: string;
};

export const systemUsers: SystemUser[] = [
  {
    id: "rodrigo-mendez",
    nombre: "Rodrigo Méndez",
    email: "rodrigo.mendez@estudio.com.ar",
    rol: "administrador",
    estado: "activo",
    ultimoAcceso: "2026-07-03",
  },
  {
    id: "marina-lopez",
    nombre: "Marina López",
    email: "marina.lopez@estudio.com.ar",
    rol: "supervisor",
    estado: "activo",
    ultimoAcceso: "2026-07-03",
  },
  {
    id: "diego-fernandez",
    nombre: "Diego Fernández",
    email: "diego.fernandez@estudio.com.ar",
    rol: "supervisor",
    estado: "activo",
    ultimoAcceso: "2026-07-02",
  },
  {
    id: "julieta-ibarra",
    nombre: "Julieta Ibarra",
    email: "julieta.ibarra@estudio.com.ar",
    rol: "contador",
    estado: "activo",
    ultimoAcceso: "2026-07-02",
  },
  {
    id: "nicolas-paz",
    nombre: "Nicolás Paz",
    email: "nicolas.paz@estudio.com.ar",
    rol: "contador",
    estado: "activo",
    ultimoAcceso: "2026-07-01",
  },
  {
    id: "camila-suarez",
    nombre: "Camila Suárez",
    email: "camila.suarez@estudio.com.ar",
    rol: "contador",
    estado: "activo",
    ultimoAcceso: "2026-06-15",
  },
  {
    id: "valentina-rios",
    nombre: "Valentina Ríos",
    email: "valentina.rios@estudio.com.ar",
    rol: "colaborador",
    estado: "activo",
    ultimoAcceso: "2026-06-29",
  },
  {
    id: "tomas-guzman",
    nombre: "Tomás Guzmán",
    email: "tomas.guzman@estudio.com.ar",
    rol: "colaborador",
    estado: "activo",
    ultimoAcceso: "2026-06-20",
  },
  {
    id: "agustina-torres",
    nombre: "Agustina Torres",
    email: "agustina.torres@estudio.com.ar",
    rol: "colaborador",
    estado: "inactivo",
    ultimoAcceso: "2026-05-01",
  },
  {
    id: "sofia-martinez",
    nombre: "Sofía Martínez",
    email: "sofia.martinez@estudio.com.ar",
    rol: "colaborador",
    estado: "invitacion_pendiente",
    ultimoAcceso: "",
  },
];

export type SettingsModule =
  | "dashboard"
  | "clientes"
  | "facturacion"
  | "cobranzas"
  | "empleados"
  | "horas"
  | "reportes"
  | "configuracion";

export const settingsModuleLabels: Record<SettingsModule, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  facturacion: "Facturación",
  cobranzas: "Cobranzas",
  empleados: "Empleados",
  horas: "Horas",
  reportes: "Reportes",
  configuracion: "Configuración",
};

export const settingsModuleOrder: SettingsModule[] = [
  "dashboard",
  "clientes",
  "facturacion",
  "cobranzas",
  "empleados",
  "horas",
  "reportes",
  "configuracion",
];

export type PermissionAction = "ver" | "crear" | "editar" | "eliminar";

export const permissionActionLabels: Record<PermissionAction, string> = {
  ver: "Ver",
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
};

export const permissionActionOrder: PermissionAction[] = ["ver", "crear", "editar", "eliminar"];

type ModulePermission = Record<PermissionAction, boolean>;

function perm(ver: boolean, crear = false, editar = false, eliminar = false): ModulePermission {
  return { ver, crear, editar, eliminar };
}

const NONE = perm(false);
const FULL = perm(true, true, true, true);

export const rolePermissions: Record<UserRole, Record<SettingsModule, ModulePermission>> = {
  administrador: {
    dashboard: FULL,
    clientes: FULL,
    facturacion: FULL,
    cobranzas: FULL,
    empleados: FULL,
    horas: FULL,
    reportes: FULL,
    configuracion: FULL,
  },
  supervisor: {
    dashboard: perm(true),
    clientes: perm(true, true, true),
    facturacion: perm(true, true, true),
    cobranzas: perm(true, true, true),
    empleados: perm(true, false, true),
    horas: perm(true, true, true, true),
    reportes: perm(true),
    configuracion: NONE,
  },
  contador: {
    dashboard: perm(true),
    clientes: perm(true, true, true),
    facturacion: perm(true, true, true),
    cobranzas: perm(true, true, true),
    empleados: perm(true),
    horas: perm(true, true, true),
    reportes: perm(true),
    configuracion: NONE,
  },
  colaborador: {
    dashboard: perm(true),
    clientes: perm(true),
    facturacion: perm(true),
    cobranzas: NONE,
    empleados: NONE,
    horas: perm(true, true),
    reportes: NONE,
    configuracion: NONE,
  },
};

export function getAccessibleModules(role: UserRole): SettingsModule[] {
  return settingsModuleOrder.filter((module) => rolePermissions[role][module].ver);
}

function getNextInvoiceSequence(): string {
  const numbers = invoices.map((invoice) => {
    const match = invoice.numero.match(/(\d+)-(\d+)$/);
    return match ? Number(match[2]) : 0;
  });
  return String(Math.max(...numbers, 0) + 1).padStart(5, "0");
}

export type BillingSettings = {
  ivaPorDefecto: number;
  moneda: string;
  condicionPagoPorDefecto: string;
  diasVencimiento: number;
  puntoVenta: string;
  proximoNumeroFactura: string;
};

export const billingSettings: BillingSettings = {
  ivaPorDefecto: 21,
  moneda: "ARS — Peso argentino",
  condicionPagoPorDefecto: "30 días",
  diasVencimiento: 30,
  puntoVenta: "0003",
  proximoNumeroFactura: `0003-${getNextInvoiceSequence()}`,
};

export type HoursSettings = {
  jornadaEstandarHoras: number;
  valorHoraInternoPorDefecto: number;
  valorHoraFacturablePorDefecto: number;
  objetivoProductividad: number;
  permitirHorasAdicionales: boolean;
  requerirAprobacionHoras: boolean;
};

export const hoursSettings: HoursSettings = {
  jornadaEstandarHoras: 8,
  valorHoraInternoPorDefecto: 3600,
  valorHoraFacturablePorDefecto: 7800,
  objetivoProductividad: 70,
  permitirHorasAdicionales: true,
  requerirAprobacionHoras: true,
};

export type SystemPreferenceKey =
  | "notificarFacturasVencidas"
  | "alertarClientesEnMora"
  | "recordatorioCargaHoras"
  | "resumenDiario"
  | "sugerenciasIA";

export type SystemPreference = {
  key: SystemPreferenceKey;
  label: string;
  description: string;
  defaultValue: boolean;
};

export const systemPreferences: SystemPreference[] = [
  {
    key: "notificarFacturasVencidas",
    label: "Notificaciones de facturas vencidas",
    description: "Avisa cuando una factura emitida supera su fecha de vencimiento sin cobrarse.",
    defaultValue: true,
  },
  {
    key: "alertarClientesEnMora",
    label: "Alertas de clientes en mora",
    description: "Notifica cuando un cliente supera los 30 días sin registrar pagos.",
    defaultValue: true,
  },
  {
    key: "recordatorioCargaHoras",
    label: "Recordatorios de carga de horas",
    description: "Envía un recordatorio al equipo si quedan horas de la semana sin cargar.",
    defaultValue: true,
  },
  {
    key: "resumenDiario",
    label: "Resumen diario",
    description: "Envía un resumen de la actividad del estudio al finalizar el día.",
    defaultValue: false,
  },
  {
    key: "sugerenciasIA",
    label: "Sugerencias del asistente IA",
    description: "Muestra recomendaciones automáticas en Dashboard, Clientes, Facturación y Cobranzas.",
    defaultValue: true,
  },
];
