import { config } from "@/config";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const requiresAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (!req.headers.authorization) {
    throw new UnauthorizedError("credentials_required");
  }

  const parts = req.headers.authorization.split(" ");

  if (parts.length !== 2) {
    throw new UnauthorizedError("credentials_bad_format");
  }
  const scheme = parts[0];
  const credentials = parts[1];

  if (/^Bearer$/i.test(scheme)) {
    token = credentials;
  } else {
    throw new UnauthorizedError("credentials_bad_scheme");
  }

  if (!token) {
    throw new UnauthorizedError("credentials_required");
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.auth = payload as JwtPayload;
  } catch (err) {
    throw new UnauthorizedError("invalid_token");
  }

  next();
};
