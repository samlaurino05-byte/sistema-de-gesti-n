# Arquitectura de datos

Este documento registra decisiones de diseño del modelo de datos (`prisma/schema.prisma`) que no son evidentes leyendo el schema solo, y que no deberían perderse ni redecidirse sin querer en un sprint futuro. No describe cómo usar Prisma ni repite lo que ya está comentado en el schema — solo el *por qué* de las decisiones no obvias.

## Multi-tenancy

Toda entidad de negocio pertenece a una `Organization` vía `organizationId`. Ninguna query de negocio debería ejecutarse sin filtrar por `organizationId`. Esto no cambió en Sprint 8.1b.

## User, Membership, Organization y Role

**Decisión:** `User` es una identidad global (solo `email` es único a nivel plataforma). No tiene `organizationId` ni `roleId` propios. La pertenencia a una organización, con el rol correspondiente, vive en `Membership` (`User` ⇄ `Organization`, con `roleId` y `estado`).

Por qué: un mismo `User` puede pertenecer a varias organizaciones, con un rol distinto en cada una. Guardar `organizationId`/`roleId` directo en `User` solo permite una organización por cuenta.

`Membership` tiene `@@unique([userId, organizationId])`: no puede haber dos membresías del mismo usuario en la misma organización.

**Organización activa de sesión:** no se persiste en ningún campo del schema (no hay `lastOrganizationId` ni similar en `User`). Es responsabilidad de la capa de sesión/auth, todavía no implementada: al iniciar sesión, esa capa debe elegir la organización activa entre las `Membership` con `estado = ACTIVE` del usuario (por ejemplo, la última usada, o pidiéndole que elija si tiene más de una). Esto queda pendiente de implementar junto con la autenticación.

## User.estado vs. Membership.estado

Ambos campos coexisten deliberadamente y responden preguntas distintas:

- **`User.estado`** (`UserStatus`: `ACTIVO` / `INVITACION_PENDIENTE` / `INACTIVO`) — estado de la **cuenta a nivel plataforma**, independiente de cualquier organización.
- **`Membership.estado`** (`MembershipStatus`: `ACTIVE` / `PENDING` / `INACTIVE`) — estado del **acceso del usuario a una organización específica**.

Una cuenta con `User.estado = ACTIVO` puede tener una `Membership` `ACTIVE` en una organización y otra `INACTIVE` en otra (por ejemplo, si dejó de trabajar para un cliente del estudio pero sigue activo en el estudio dueño de la cuenta). La lógica de autorización deberá siempre revisar ambos niveles: la cuenta debe estar activa a nivel plataforma **y** la membresía debe estar activa en la organización correspondiente.

## Invoice, InvoiceItem y HourEntry

**Decisión:** `InvoiceItem` es la única fuente de verdad de la relación entre una factura y las horas que factura. `HourEntry` no tiene `invoiceId` propio; el vínculo pasa por `InvoiceItem.hourEntryId` (opcional, único — una hora se factura como máximo en un ítem).

Por qué: antes de Sprint 8.1b, `HourEntry.invoiceId` e `Invoice.hourEntries` ya resolvían esa relación de forma directa. Al introducir `InvoiceItem` como línea de factura, mantener ambos caminos (el directo y el mediado por `InvoiceItem`) habría creado dos punteros que podrían desincronizarse. Se eliminó el directo, siguiendo el mismo criterio de diseño que ya usaba el schema para no guardar `deudaPendiente` ni `saldoPendiente` (valores derivables no se persisten).

`InvoiceItem` también admite ítems manuales sin `HourEntry` de origen (ajustes, honorarios fijos, gastos reintegrables), dejando `hourEntryId` en `null`.

**Nombres de campo:** `InvoiceItem` usa nombres en español (`descripcion`, `cantidad`, `precioUnitario`, `alicuotaIva`, `montoIva`) para seguir la convención del resto del schema. Se evaluó usar nombres en inglés y se decidió **no** hacerlo — no se justifica una migración solo por naming.

### Snapshot histórico en Invoice

`Invoice.concepto`, `Invoice.subtotal`, `Invoice.iva` e `Invoice.total` se mantienen como **snapshot histórico fijado al emitir la factura**. No se recalculan ni se derivan en el schema a partir de `InvoiceItem` — son responsabilidad de la capa de aplicación.

**Cuando se conecte el módulo de Facturación a datos reales, la capa de aplicación deberá:**

1. Calcular los `InvoiceItem` (a partir de `HourEntry` aprobadas y/o ítems manuales).
2. Calcular `subtotal`, IVA y `total` a nivel factura a partir de esos ítems.
3. Validar que los totales de `Invoice` coincidan con la suma de `InvoiceItem` antes de persistir.
4. Guardar la factura y sus ítems dentro de una única operación transaccional (`prisma.$transaction`), para que nunca quede una `Invoice` sin sus `InvoiceItem` o viceversa.
5. Impedir la emisión de una factura si esa validación de consistencia falla.

Esto no está implementado todavía — el schema solo deja la estructura lista.

## Deuda técnica documentada

- **`MembershipStatus`** usa valores en inglés (`ACTIVE` / `PENDING` / `INACTIVE`), mientras el resto de los enums del schema (`UserStatus`, `EmployeeStatus`, `ClientStatus`, etc.) están en español. Decisión consciente para Sprint 8.1b: no se normaliza ahora. Si en el futuro se decide unificar convención de enums, `MembershipStatus` es el primer candidato a revisar (implica migración de datos si ya hay membresías creadas).
- La reconciliación entre `Invoice` (snapshot) e `InvoiceItem` (detalle) descrita arriba no tiene todavía validación a nivel de aplicación ni de base de datos — es un punto a resolver antes de habilitar la emisión real de facturas.
