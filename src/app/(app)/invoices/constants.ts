export type EmitInvoiceState = {
  status: "idle" | "error" | "success";
  error?: string;
  slug?: string;
  numero?: string;
};

export const initialEmitInvoiceState: EmitInvoiceState = { status: "idle" };

export type RegisterPaymentState = {
  status: "idle" | "error" | "success";
  error?: string;
};

export const initialRegisterPaymentState: RegisterPaymentState = { status: "idle" };
