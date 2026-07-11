import {
  Award,
  BadgeCheck,
  CalendarPlus,
  FileCheck2,
  GraduationCap,
  MessageSquareText,
  Plane,
  StickyNote,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { clients, type Client } from "@/lib/mock/clients";
import { formatCurrency, formatDate } from "@/lib/utils";

export type EmployeeStatus = "activo" | "vacaciones" | "licencia" | "inactivo";

export type Employee = {
  id: string;
  nombre: string;
  cargo: string;
  area: string;
  estado: EmployeeStatus;
  valorHoraInterno: number;
  email: string;
  telefono: string;
  cuil: string;
  direccion: string;
  condicionContractual: string;
  fechaIngreso: string;
};

export const employees: Employee[] = [
  {
    id: "marina-lopez",
    nombre: "Marina López",
    cargo: "Contadora Senior",
    area: "Contable",
    estado: "activo",
    valorHoraInterno: 4200,
    email: "marina.lopez@estudio.com.ar",
    telefono: "+54 11 5566-1010",
    cuil: "27-32145678-4",
    direccion: "Av. Callao 1450, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2019-03-04",
  },
  {
    id: "diego-fernandez",
    nombre: "Diego Fernández",
    cargo: "Contador Senior",
    area: "Contable",
    estado: "activo",
    valorHoraInterno: 4200,
    email: "diego.fernandez@estudio.com.ar",
    telefono: "+54 11 5566-2020",
    cuil: "20-30456789-1",
    direccion: "Av. Corrientes 3320, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2018-07-16",
  },
  {
    id: "julieta-ibarra",
    nombre: "Julieta Ibarra",
    cargo: "Analista Impositiva",
    area: "Impuestos",
    estado: "activo",
    valorHoraInterno: 3600,
    email: "julieta.ibarra@estudio.com.ar",
    telefono: "+54 11 5566-3030",
    cuil: "27-33987654-2",
    direccion: "Av. Rivadavia 5200, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2021-02-08",
  },
  {
    id: "nicolas-paz",
    nombre: "Nicolás Paz",
    cargo: "Liquidador de Sueldos",
    area: "Liquidaciones",
    estado: "activo",
    valorHoraInterno: 3200,
    email: "nicolas.paz@estudio.com.ar",
    telefono: "+54 11 5566-4040",
    cuil: "20-35123456-7",
    direccion: "Av. Directorio 890, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2022-05-23",
  },
  {
    id: "rodrigo-mendez",
    nombre: "Rodrigo Méndez",
    cargo: "Socio Gerente",
    area: "Dirección",
    estado: "activo",
    valorHoraInterno: 6500,
    email: "rodrigo.mendez@estudio.com.ar",
    telefono: "+54 11 5566-5050",
    cuil: "20-25874563-9",
    direccion: "Av. Santa Fe 2100, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2015-01-12",
  },
  {
    id: "valentina-rios",
    nombre: "Valentina Ríos",
    cargo: "Administrativa",
    area: "Administración",
    estado: "activo",
    valorHoraInterno: 2400,
    email: "valentina.rios@estudio.com.ar",
    telefono: "+54 11 5566-6060",
    cuil: "27-36789123-5",
    direccion: "Av. Cabildo 3100, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2023-04-17",
  },
  {
    id: "tomas-guzman",
    nombre: "Tomás Guzmán",
    cargo: "Contador Junior",
    area: "Contable",
    estado: "vacaciones",
    valorHoraInterno: 2800,
    email: "tomas.guzman@estudio.com.ar",
    telefono: "+54 11 5566-7070",
    cuil: "20-38456123-0",
    direccion: "Av. Nazca 1780, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2023-09-11",
  },
  {
    id: "camila-suarez",
    nombre: "Camila Suárez",
    cargo: "Analista Impositiva",
    area: "Impuestos",
    estado: "licencia",
    valorHoraInterno: 3400,
    email: "camila.suarez@estudio.com.ar",
    telefono: "+54 11 5566-8080",
    cuil: "27-34567891-3",
    direccion: "Av. Warnes 640, CABA",
    condicionContractual: "Relación de dependencia",
    fechaIngreso: "2020-11-02",
  },
  {
    id: "agustina-torres",
    nombre: "Agustina Torres",
    cargo: "Administrativa",
    area: "Administración",
    estado: "inactivo",
    valorHoraInterno: 2200,
    email: "agustina.torres@estudio.com.ar",
    telefono: "+54 11 5566-9090",
    cuil: "27-31234987-6",
    direccion: "Av. San Martín 2250, CABA",
    condicionContractual: "Monotributista",
    fechaIngreso: "2019-08-27",
  },
];

export function getEmployeeById(id: string) {
  return employees.find((employee) => employee.id === id);
}

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  activo: "Activo",
  vacaciones: "Vacaciones",
  licencia: "Licencia",
  inactivo: "Inactivo",
};

export function getAssignedClients(employee: Employee): Client[] {
  return clients.filter((client) => client.responsableInterno === employee.nombre);
}

export type EmployeeTimelineEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "default" | "success" | "warning" | "danger";
};

export function getEmployeeTimeline(employee: Employee): EmployeeTimelineEntry[] {
  const entries: EmployeeTimelineEntry[] = [
    {
      id: "ingreso",
      date: formatDate(employee.fechaIngreso),
      title: "Ingreso al equipo",
      description: `Incorporado como ${employee.cargo} en el área de ${employee.area}.`,
      icon: UserPlus,
      tone: "default",
    },
    {
      id: "asignacion",
      date: "Hace 6 meses",
      title: "Actualización de cartera",
      description: `Cartera de clientes revisada junto al responsable de ${employee.area}.`,
      icon: BadgeCheck,
      tone: "default",
    },
  ];

  if (employee.estado === "vacaciones") {
    entries.push({
      id: "vacaciones",
      date: "Esta semana",
      title: "Inicio de vacaciones",
      description: "El empleado se encuentra de vacaciones. Sus tareas fueron redistribuidas temporalmente.",
      icon: Plane,
      tone: "warning",
    });
  } else if (employee.estado === "licencia") {
    entries.push({
      id: "licencia",
      date: "Esta semana",
      title: "Licencia en curso",
      description: "El empleado se encuentra con licencia autorizada por RRHH.",
      icon: StickyNote,
      tone: "warning",
    });
  } else if (employee.estado === "inactivo") {
    entries.push({
      id: "baja",
      date: "Hace 1 mes",
      title: "Cuenta dada de baja",
      description: "El empleado ya no forma parte activa del equipo.",
      icon: UserX,
      tone: "danger",
    });
  } else {
    entries.push({
      id: "capacitacion",
      date: "Hace 2 semanas",
      title: "Capacitación completada",
      description: "Finalizó la capacitación interna correspondiente a su área.",
      icon: GraduationCap,
      tone: "success",
    });
  }

  return entries;
}

export function getEmployeeDocuments(employee: Employee) {
  return [
    {
      id: "contrato",
      name: `Contrato laboral — ${employee.nombre}.pdf`,
      type: "Contrato",
      date: formatDate(employee.fechaIngreso),
      size: "298 KB",
    },
    {
      id: "recibo",
      name: "Último recibo de sueldo.pdf",
      type: "Recibo de sueldo",
      date: "Hace 4 días",
      size: "115 KB",
    },
    {
      id: "legajo",
      name: "Legajo digital completo.pdf",
      type: "Legajo",
      date: "Hace 2 meses",
      size: "540 KB",
    },
  ];
}

export type EmployeeObservation = {
  id: string;
  date: string;
  author: string;
  content: string;
};

export function getEmployeeObservations(employee: Employee): EmployeeObservation[] {
  const observations: EmployeeObservation[] = [
    {
      id: "obs-1",
      date: "Hace 1 mes",
      author: "Recursos Humanos",
      content: `Buen desempeño general en ${employee.area}. Cumple los plazos internos de entrega.`,
    },
  ];

  if (employee.estado === "licencia") {
    observations.unshift({
      id: "obs-0",
      date: "Esta semana",
      author: "Recursos Humanos",
      content: "Licencia autorizada. Reincorporación estimada a confirmar con el área médica.",
    });
  } else if (employee.estado === "vacaciones") {
    observations.unshift({
      id: "obs-0",
      date: "Esta semana",
      author: "Recursos Humanos",
      content: "Vacaciones programadas y aprobadas. Tareas cubiertas por el equipo del área.",
    });
  }

  return observations;
}

// `assignedClientsCount` se recibe como parámetro (en vez de recalcularse
// acá con getAssignedClients) para que quien llame pueda pasar el conteo
// real de Prisma (Client.responsableInternoId) cuando esté disponible, sin
// que este módulo dependa de la cartera mock de clientes.
export function getEmployeeAiInsights(employee: Employee, assignedClientsCount: number): string[] {
  const insights: string[] = [];

  if (assignedClientsCount > 0) {
    insights.push(
      `${employee.nombre} tiene ${assignedClientsCount} clientes asignados. Valor hora interno de ${formatCurrency(employee.valorHoraInterno)}.`
    );
  } else {
    insights.push(`${employee.nombre} no tiene clientes asignados actualmente.`);
  }

  if (employee.estado === "vacaciones" || employee.estado === "licencia") {
    insights.push("Considerá reasignar tareas urgentes mientras dure la ausencia.");
  } else if (employee.estado === "inactivo") {
    insights.push("El empleado está inactivo. Revisá si corresponde reasignar su cartera de clientes.");
  } else {
    insights.push("Sin alertas pendientes. El desempeño se mantiene dentro de lo esperado.");
  }

  return insights;
}

export const employeeQuickActions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Cargar horas", icon: CalendarPlus },
  { label: "Registrar nota", icon: MessageSquareText },
  { label: "Generar recibo", icon: FileCheck2 },
  { label: "Evaluar desempeño", icon: Award },
];
