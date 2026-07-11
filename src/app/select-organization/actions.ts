"use server";

import { redirect } from "next/navigation";
import { updateSession } from "@/auth";

// La validación real (¿tiene este usuario una Membership ACTIVE en esa
// organización?) vive únicamente en el callback `jwt` de src/auth.ts
// (trigger "update"). Acá no se repite esa lógica: si la organización no es
// válida, el token queda sin resolver y requireActiveSession() vuelve a
// mandar a este selector.
export async function selectOrganization(organizationId: string) {
  await updateSession({ organizationId });
  redirect("/dashboard");
}
