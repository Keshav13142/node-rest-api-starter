import { StatusCodes } from "http-status-codes";

class AppError extends Error {
  message: string;
  statusCode: StatusCodes;
  cause?: string;

  constructor({
    message,
    statusCode,
    cause,
  }: {
    message: string;
    statusCode: number;
    cause?: string;
  }) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.cause = cause;

    Error.captureStackTrace(this);
  }
}

export default AppError;
