export type LoginState = {
  status: "idle" | "error" | "success";
  error?: string;
};

export const initialLoginState: LoginState = { status: "idle" };
