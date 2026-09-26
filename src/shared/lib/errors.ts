export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message: string,
    opts?: { fieldErrors?: Record<string, string[]>; cause?: unknown }
  ) {
    super(message, opts?.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = "AppError";
    this.code = code;
    this.fieldErrors = opts?.fieldErrors;
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Vui lòng đăng nhập lại.") {
    super("UNAUTHENTICATED", message);
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bạn không có quyền thực hiện thao tác này.") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy tài nguyên.") {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(
    fieldErrors: Record<string, string[]>,
    message = "Dữ liệu không hợp lệ."
  ) {
    super("VALIDATION", message, { fieldErrors });
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Dữ liệu đã tồn tại hoặc xung đột.") {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}
