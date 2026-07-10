-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVO', 'INVITACION_PENDIENTE', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVO', 'VACACIONES', 'LICENCIA', 'INACTIVO');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMINISTRADOR', 'SUPERVISOR', 'CONTADOR', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "SettingsModule" AS ENUM ('DASHBOARD', 'CLIENTES', 'FACTURACION', 'COBRANZAS', 'EMPLEADOS', 'HORAS', 'REPORTES', 'CONFIGURACION');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('VER', 'CREAR', 'EDITAR', 'ELIMINAR');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVO', 'MORA', 'PAUSADO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "HourEntryStatus" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'FACTURADA');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('BORRADOR', 'EMITIDA', 'PAGADA', 'VENCIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'CHEQUE', 'TARJETA', 'OTRO');

-- CreateEnum
CREATE TYPE "CollectionChannel" AS ENUM ('LLAMADA', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "SystemPreferenceKey" AS ENUM ('NOTIFICAR_FACTURAS_VENCIDAS', 'ALERTAR_CLIENTES_EN_MORA', 'RECORDATORIO_CARGA_HORAS', 'RESUMEN_DIARIO', 'SUGERENCIAS_IA');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "logoInitials" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "nombre" TEXT NOT NULL,
    "estado" "UserStatus" NOT NULL DEFAULT 'ACTIVO',
    "ultimoAcceso" TIMESTAMP(3),
    "roleId" TEXT NOT NULL,
    "employeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "estado" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVO',
    "valorHoraInterno" DECIMAL(14,2) NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "condicionContractual" TEXT NOT NULL,
    "fechaIngreso" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nombre" "RoleName" NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "module" "SettingsModule" NOT NULL,
    "action" "PermissionAction" NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "condicionFiscal" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "estado" "ClientStatus" NOT NULL DEFAULT 'ACTIVO',
    "condicionPago" TEXT NOT NULL,
    "valorHora" DECIMAL(14,2) NOT NULL,
    "facturacionMensual" DECIMAL(14,2) NOT NULL,
    "fechaAlta" DATE NOT NULL,
    "responsableInternoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HourEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "fecha" DATE NOT NULL,
    "proyecto" TEXT NOT NULL,
    "horas" DECIMAL(5,2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "HourEntryStatus" NOT NULL DEFAULT 'PENDIENTE',
    "valorHoraInterno" DECIMAL(14,2) NOT NULL,
    "valorHoraCliente" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HourEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "puntoVenta" TEXT NOT NULL,
    "numeroSecuencial" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "fechaEmision" DATE,
    "fechaVencimiento" DATE,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "iva" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "estado" "InvoiceStatus" NOT NULL DEFAULT 'BORRADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceCounter" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "puntoVenta" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "fecha" DATE NOT NULL,
    "medioPago" "PaymentMethod" NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionFollowUp" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "enSeguimiento" BOOLEAN NOT NULL DEFAULT false,
    "asignadoAId" TEXT,
    "notas" TEXT,
    "canalUtilizado" "CollectionChannel",
    "fechaUltimoContacto" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ivaPorDefecto" INTEGER NOT NULL DEFAULT 21,
    "moneda" TEXT NOT NULL DEFAULT 'ARS — Peso argentino',
    "condicionPagoPorDefecto" TEXT NOT NULL,
    "diasVencimiento" INTEGER NOT NULL,
    "puntoVenta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoursSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jornadaEstandarHoras" DECIMAL(4,2) NOT NULL,
    "valorHoraInternoPorDefecto" DECIMAL(14,2) NOT NULL,
    "valorHoraFacturablePorDefecto" DECIMAL(14,2) NOT NULL,
    "objetivoProductividad" INTEGER NOT NULL,
    "permitirHorasAdicionales" BOOLEAN NOT NULL DEFAULT true,
    "requerirAprobacionHoras" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoursSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPreference" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" "SystemPreferenceKey" NOT NULL,
    "value" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "Employee_organizationId_idx" ON "Employee"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_organizationId_slug_key" ON "Employee"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "Role_organizationId_idx" ON "Role"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_organizationId_nombre_key" ON "Role"("organizationId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE INDEX "Client_organizationId_estado_idx" ON "Client"("organizationId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Client_organizationId_slug_key" ON "Client"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "HourEntry_organizationId_idx" ON "HourEntry"("organizationId");

-- CreateIndex
CREATE INDEX "HourEntry_organizationId_fecha_idx" ON "HourEntry"("organizationId", "fecha");

-- CreateIndex
CREATE INDEX "HourEntry_employeeId_idx" ON "HourEntry"("employeeId");

-- CreateIndex
CREATE INDEX "HourEntry_clientId_idx" ON "HourEntry"("clientId");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_estado_idx" ON "Invoice"("organizationId", "estado");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_puntoVenta_numeroSecuencial_key" ON "Invoice"("organizationId", "puntoVenta", "numeroSecuencial");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceCounter_organizationId_puntoVenta_key" ON "InvoiceCounter"("organizationId", "puntoVenta");

-- CreateIndex
CREATE INDEX "Payment_organizationId_idx" ON "Payment"("organizationId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionFollowUp_invoiceId_key" ON "CollectionFollowUp"("invoiceId");

-- CreateIndex
CREATE INDEX "CollectionFollowUp_organizationId_idx" ON "CollectionFollowUp"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingSettings_organizationId_key" ON "BillingSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "HoursSettings_organizationId_key" ON "HoursSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPreference_organizationId_key_key" ON "SystemPreference"("organizationId", "key");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_responsableInternoId_fkey" FOREIGN KEY ("responsableInternoId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourEntry" ADD CONSTRAINT "HourEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourEntry" ADD CONSTRAINT "HourEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourEntry" ADD CONSTRAINT "HourEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourEntry" ADD CONSTRAINT "HourEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceCounter" ADD CONSTRAINT "InvoiceCounter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionFollowUp" ADD CONSTRAINT "CollectionFollowUp_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSettings" ADD CONSTRAINT "BillingSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoursSettings" ADD CONSTRAINT "HoursSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemPreference" ADD CONSTRAINT "SystemPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
