import AppError from "@/errors/custom-error";
import { RequestValidationError } from "@/errors/request-validation-error";
import { getErrorMessage } from "@/utils/http";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

// Global error handler
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof RequestValidationError) {
    logger.info({ error }, "Validation error");
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        cause: error.cause,
        errors: error.errors,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    logger.info({ error }, "App error");
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        cause: error.cause,
      },
    });
    return;
  }

  logger.info({ error }, "Error");
  res.status(500).json({
    error: {
      message:
        getErrorMessage(error) ||
        "An error occurred. Please view logs for more details",
    },
  });
}
