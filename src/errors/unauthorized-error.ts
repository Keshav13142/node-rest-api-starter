import AppError from "./custom-error";

type ErrorCode =
  | "credentials_bad_scheme"
  | "credentials_bad_format"
  | "credentials_required"
  | "invalid_token"
  | "revoked_token";

export class UnauthorizedError extends AppError {
  constructor(code: ErrorCode) {
    super({ message: "UnauthorizedError", statusCode: 401, cause: code });
  }
}
