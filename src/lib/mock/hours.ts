export type HourEntryStatus = "pendiente" | "aprobada" | "rechazada" | "facturada";

export type HourEntry = {
  id: string;
  fecha: string;
  employeeId: string;
  clientId: string;
  proyecto: string;
  horas: number;
  valorHoraInterno: number;
  valorHoraCliente: number;
  descripcion: string;
  estado: HourEntryStatus;
  invoiceId?: string;
};

export const hourEntryStatusLabels: Record<HourEntryStatus, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  facturada: "Facturada",
};

export const hourEntries: HourEntry[] = [
  {
    id: "h1",
    fecha: "2026-06-03",
    employeeId: "marina-lopez",
    clientId: "estudio-beltran",
    proyecto: "Cierre mensual",
    horas: 6,
    valorHoraInterno: 4200,
    valorHoraCliente: 8500,
    descripcion: "Cierre contable del mes de mayo.",
    estado: "facturada",
    invoiceId: "inv-estudio-beltran-01",
  },
  {
    id: "h2",
    fecha: "2026-06-10",
    employeeId: "marina-lopez",
    clientId: "comercial-rivas",
    proyecto: "Seguimiento de cobranza",
    horas: 3,
    valorHoraInterno: 4200,
    valorHoraCliente: 7500,
    descripcion: "Revisión de estado de cuenta y gestión de cobranza.",
    estado: "aprobada",
  },
  {
    id: "h3",
    fecha: "2026-06-18",
    employeeId: "marina-lopez",
    clientId: "boutique-aurora",
    proyecto: "Presentación IVA",
    horas: 4,
    valorHoraInterno: 4200,
    valorHoraCliente: 5800,
    descripcion: "Preparación y presentación de IVA mensual.",
    estado: "aprobada",
  },
  {
    id: "h4",
    fecha: "2026-07-01",
    employeeId: "marina-lopez",
    clientId: "estudio-beltran",
    proyecto: "Cierre mensual",
    horas: 5,
    valorHoraInterno: 4200,
    valorHoraCliente: 8500,
    descripcion: "Inicio del cierre contable de junio.",
    estado: "pendiente",
  },
  {
    id: "h5",
    fecha: "2026-07-02",
    employeeId: "marina-lopez",
    clientId: "comercial-rivas",
    proyecto: "Recordatorio de pago",
    horas: 2,
    valorHoraInterno: 4200,
    valorHoraCliente: 7500,
    descripcion: "Envío de recordatorio de pago y seguimiento telefónico.",
    estado: "pendiente",
  },
  {
    id: "h6",
    fecha: "2026-06-05",
    employeeId: "diego-fernandez",
    clientId: "distribuidora-norte",
    proyecto: "Conciliación bancaria",
    horas: 5,
    valorHoraInterno: 4200,
    valorHoraCliente: 7800,
    descripcion: "Conciliación de cuentas bancarias de mayo.",
    estado: "facturada",
    invoiceId: "inv-distribuidora-norte-01",
  },
  {
    id: "h7",
    fecha: "2026-06-14",
    employeeId: "diego-fernandez",
    clientId: "farmacia-central",
    proyecto: "Presentación IVA",
    horas: 4,
    valorHoraInterno: 4200,
    valorHoraCliente: 8000,
    descripcion: "Preparación y presentación de IVA mensual.",
    estado: "aprobada",
  },
  {
    id: "h8",
    fecha: "2026-06-21",
    employeeId: "diego-fernandez",
    clientId: "constructora-del-plata",
    proyecto: "Auditoría interna",
    horas: 8,
    valorHoraInterno: 4200,
    valorHoraCliente: 9500,
    descripcion: "Revisión de procesos administrativos internos.",
    estado: "facturada",
    invoiceId: "inv-constructora-del-plata-01",
  },
  {
    id: "h9",
    fecha: "2026-07-01",
    employeeId: "diego-fernandez",
    clientId: "distribuidora-norte",
    proyecto: "Cierre mensual",
    horas: 6,
    valorHoraInterno: 4200,
    valorHoraCliente: 7800,
    descripcion: "Inicio del cierre contable de junio.",
    estado: "pendiente",
  },
  {
    id: "h10",
    fecha: "2026-07-02",
    employeeId: "diego-fernandez",
    clientId: "constructora-del-plata",
    proyecto: "Auditoría interna",
    horas: 4,
    valorHoraInterno: 4200,
    valorHoraCliente: 9500,
    descripcion: "Continuación de auditoría de procesos.",
    estado: "pendiente",
  },
  {
    id: "h11",
    fecha: "2026-06-07",
    employeeId: "julieta-ibarra",
    clientId: "tech-solutions",
    proyecto: "Presentación Ganancias",
    horas: 5,
    valorHoraInterno: 3600,
    valorHoraCliente: 9200,
    descripcion: "Cálculo y presentación del impuesto a las ganancias.",
    estado: "facturada",
    invoiceId: "inv-tech-solutions-01",
  },
  {
    id: "h12",
    fecha: "2026-06-16",
    employeeId: "julieta-ibarra",
    clientId: "grupo-almendra",
    proyecto: "Revisión impositiva",
    horas: 3,
    valorHoraInterno: 3600,
    valorHoraCliente: 7200,
    descripcion: "Revisión de situación impositiva general.",
    estado: "rechazada",
  },
  {
    id: "h13",
    fecha: "2026-06-24",
    employeeId: "julieta-ibarra",
    clientId: "consultora-vertice",
    proyecto: "Planificación fiscal",
    horas: 6,
    valorHoraInterno: 3600,
    valorHoraCliente: 10500,
    descripcion: "Planificación fiscal del segundo semestre.",
    estado: "aprobada",
  },
  {
    id: "h14",
    fecha: "2026-07-01",
    employeeId: "julieta-ibarra",
    clientId: "tech-solutions",
    proyecto: "Presentación IVA",
    horas: 4,
    valorHoraInterno: 3600,
    valorHoraCliente: 9200,
    descripcion: "Preparación de IVA mensual.",
    estado: "pendiente",
  },
  {
    id: "h15",
    fecha: "2026-06-06",
    employeeId: "nicolas-paz",
    clientId: "panaderia-del-sol",
    proyecto: "Liquidación de sueldos",
    horas: 4,
    valorHoraInterno: 3200,
    valorHoraCliente: 6200,
    descripcion: "Liquidación de sueldos del mes de mayo.",
    estado: "facturada",
    invoiceId: "inv-panaderia-del-sol-01",
  },
  {
    id: "h16",
    fecha: "2026-06-15",
    employeeId: "nicolas-paz",
    clientId: "ferreteria-union",
    proyecto: "Liquidación de sueldos",
    horas: 3,
    valorHoraInterno: 3200,
    valorHoraCliente: 6500,
    descripcion: "Liquidación de sueldos y cargas sociales.",
    estado: "aprobada",
  },
  {
    id: "h17",
    fecha: "2026-06-23",
    employeeId: "nicolas-paz",
    clientId: "libreria-horizonte",
    proyecto: "Alta de empleados",
    horas: 2,
    valorHoraInterno: 3200,
    valorHoraCliente: 5500,
    descripcion: "Alta de nuevo empleado ante AFIP.",
    estado: "aprobada",
  },
  {
    id: "h18",
    fecha: "2026-07-02",
    employeeId: "nicolas-paz",
    clientId: "panaderia-del-sol",
    proyecto: "Liquidación de sueldos",
    horas: 5,
    valorHoraInterno: 3200,
    valorHoraCliente: 6200,
    descripcion: "Liquidación de sueldos del mes de junio.",
    estado: "pendiente",
  },
  {
    id: "h19",
    fecha: "2026-06-12",
    employeeId: "rodrigo-mendez",
    clientId: "constructora-del-plata",
    proyecto: "Revisión de balance",
    horas: 3,
    valorHoraInterno: 6500,
    valorHoraCliente: 9500,
    descripcion: "Revisión ejecutiva del balance trimestral.",
    estado: "aprobada",
  },
  {
    id: "h20",
    fecha: "2026-06-27",
    employeeId: "rodrigo-mendez",
    clientId: "consultora-vertice",
    proyecto: "Reunión estratégica",
    horas: 2,
    valorHoraInterno: 6500,
    valorHoraCliente: 10500,
    descripcion: "Reunión estratégica con el cliente.",
    estado: "facturada",
    invoiceId: "inv-consultora-vertice-01",
  },
  {
    id: "h21",
    fecha: "2026-06-09",
    employeeId: "valentina-rios",
    clientId: "estudio-beltran",
    proyecto: "Armado de legajos",
    horas: 4,
    valorHoraInterno: 2400,
    valorHoraCliente: 8500,
    descripcion: "Armado y digitalización de legajos.",
    estado: "aprobada",
  },
  {
    id: "h22",
    fecha: "2026-06-20",
    employeeId: "valentina-rios",
    clientId: "distribuidora-norte",
    proyecto: "Soporte administrativo",
    horas: 3,
    valorHoraInterno: 2400,
    valorHoraCliente: 7800,
    descripcion: "Soporte administrativo general.",
    estado: "aprobada",
  },
  {
    id: "h23",
    fecha: "2026-06-04",
    employeeId: "tomas-guzman",
    clientId: "estudio-beltran",
    proyecto: "Cierre mensual",
    horas: 4,
    valorHoraInterno: 2800,
    valorHoraCliente: 8500,
    descripcion: "Apoyo en el cierre contable mensual.",
    estado: "aprobada",
  },
  {
    id: "h24",
    fecha: "2026-06-11",
    employeeId: "tomas-guzman",
    clientId: "comercial-rivas",
    proyecto: "Conciliación bancaria",
    horas: 3,
    valorHoraInterno: 2800,
    valorHoraCliente: 7500,
    descripcion: "Conciliación bancaria mensual.",
    estado: "rechazada",
  },
  {
    id: "h25",
    fecha: "2026-06-08",
    employeeId: "camila-suarez",
    clientId: "tech-solutions",
    proyecto: "Revisión impositiva",
    horas: 5,
    valorHoraInterno: 3400,
    valorHoraCliente: 9200,
    descripcion: "Revisión de situación impositiva.",
    estado: "aprobada",
    invoiceId: "inv-tech-solutions-02",
  },
  {
    id: "h26",
    fecha: "2026-06-19",
    employeeId: "camila-suarez",
    clientId: "grupo-almendra",
    proyecto: "Presentación IVA",
    horas: 3,
    valorHoraInterno: 3400,
    valorHoraCliente: 7200,
    descripcion: "Preparación de IVA mensual.",
    estado: "facturada",
    invoiceId: "inv-grupo-almendra-01",
  },
];

export function getHourEntryMetrics(entry: HourEntry) {
  const costo = entry.horas * entry.valorHoraInterno;
  const facturacion = entry.horas * entry.valorHoraCliente;
  const margen = facturacion - costo;
  const margenPct = facturacion > 0 ? (margen / facturacion) * 100 : 0;

  return { costo, facturacion, margen, margenPct };
}

export function getHoursForEmployee(employeeId: string) {
  return hourEntries.filter((entry) => entry.employeeId === employeeId);
}

export function getHoursForClient(clientId: string) {
  return hourEntries.filter((entry) => entry.clientId === clientId);
}

export function isCurrentMonth(dateValue: string, reference: Date = new Date()) {
  const date = new Date(dateValue);
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export function summarizeHours(entries: HourEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      const { costo, facturacion, margen } = getHourEntryMetrics(entry);
      acc.horas += entry.horas;
      acc.costo += costo;
      acc.facturacion += facturacion;
      acc.margen += margen;
      return acc;
    },
    { horas: 0, costo: 0, facturacion: 0, margen: 0 }
  );
}

export function getProductivityRate(entries: HourEntry[]) {
  if (entries.length === 0) return 0;

  const totalHours = entries.reduce((sum, entry) => sum + entry.horas, 0);
  const validHours = entries
    .filter((entry) => entry.estado === "aprobada" || entry.estado === "facturada")
    .reduce((sum, entry) => sum + entry.horas, 0);

  return totalHours > 0 ? Math.round((validHours / totalHours) * 100) : 0;
}
