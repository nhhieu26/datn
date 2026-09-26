import type { ZodError } from "zod";
import { AppError } from "./errors";

export type ActionState<T = undefined> = {
  status: "idle" | "error" | "success";
  formError?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

export function fromZodError(error: ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

export async function runAction<T = undefined>(
  fn: () => Promise<T>
): Promise<ActionState<T>> {
  try {
    const data = await fn();
    return { status: "success", data };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        status: "error",
        formError: error.code === "VALIDATION" ? undefined : error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    console.error("Action failed", error);
    return {
      status: "error",
      formError: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    };
  }
}
