export type EmitInvoiceState = {
  status: "idle" | "error" | "success";
  error?: string;
  slug?: string;
  numero?: string;
};

export const initialEmitInvoiceState: EmitInvoiceState = { status: "idle" };
