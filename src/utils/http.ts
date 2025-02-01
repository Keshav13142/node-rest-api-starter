import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export function httpError({
  res,
  message,
  code,
  cause,
}: {
  res: Response;
  message: string;
  code: StatusCodes;
  cause?: string;
}) {
  res.status(code).send({
    message,
    cause,
  });
}

export const httpErrorSchema = z.object({
  message: z.string(),
  cause: z.string().optional(),
});

export const errorResponses = {
  404: httpErrorSchema,
  400: httpErrorSchema,
  401: httpErrorSchema,
  500: httpErrorSchema,
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An error occurred";
}
