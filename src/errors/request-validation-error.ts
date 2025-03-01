import { config } from "@/config";
import AppError from "./custom-error";

export interface ValidationErrorItem {
  path: string;
  location: string;
  message: string;
}

export class RequestValidationError extends AppError {
  errors: ValidationErrorItem[];

  constructor({ errors }: { errors: ValidationErrorItem[] }) {
    super({
      message: "Validation Error",
      statusCode: 400,
    });
    this.errors = config.isDev ? errors : [];
  }
}
