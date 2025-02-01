// Reference: https://github.com/AngaBlue/express-zod-safe
import {
  RequestValidationError,
  ValidationErrorItem,
} from "@/errors/request-validation-error";
import type { Request } from "express";
import {
  type ZodRawShape,
  type ZodSchema,
  type ZodTypeAny,
  undefined,
  z,
} from "zod";

const emptyObjectSchema = z.object({}).strict();
type Empty = typeof emptyObjectSchema;

function toZodSchema(schema: Validation | undefined): ZodSchema {
  return schema ? z.object(schema as ZodRawShape).strict() : emptyObjectSchema;
}

type Validation = ZodTypeAny | ZodRawShape;

type ZodOutput<T extends Validation> = T extends ZodRawShape
  ? z.ZodObject<T>["_output"]
  : T["_output"];

interface ValidatedRequest<
  TParams extends Validation,
  TQuery extends Validation,
  TBody extends Validation
> {
  params: ZodOutput<TParams>;
  query: ZodOutput<TQuery>;
  body: ZodOutput<TBody>;
}

export function validateRequest<
  TParams extends Validation = Empty,
  TQuery extends Validation = Empty,
  TBody extends Validation = Empty
>(
  schemas: {
    params?: TParams;
    query?: TQuery;
    body?: TBody;
  },
  req: Request
): ValidatedRequest<TParams, TQuery, TBody> {
  const errors: ValidationErrorItem[] = [];

  const result = Object.fromEntries(
    (["params", "query", "body"] as const).map((type) => {
      const schema = toZodSchema(schemas[type]);
      const { success, error, data } = schema.safeParse(req[type] ?? {});

      if (!success) {
        error.issues.forEach(({ path, message }) => {
          errors.push({ location: type, path: path[0] as string, message });
        });
        return [type, undefined];
      }

      return [type, data];
    })
  );

  if (errors.length > 0) {
    throw new RequestValidationError({ errors });
  }

  return result as ValidatedRequest<TParams, TQuery, TBody>;
}
