import { NextResponse } from "next/server";
import { AppError, type ErrorCode } from "./errors";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  CONFLICT: 409,
  INTERNAL: 500,
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        message: error.message,
        fieldErrors: error.fieldErrors,
      },
      { status: STATUS_BY_CODE[error.code] }
    );
  }

  console.error("API route failed", error);
  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL" satisfies ErrorCode,
      message: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    },
    { status: 500 }
  );
}
