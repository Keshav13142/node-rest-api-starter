import { config } from "@/config";
import { createUser, findUserByEmail } from "@/modules/user/user.service";
import { httpError } from "@/utils/http";
import { logger } from "@/utils/logger";
import { validateRequest } from "@/utils/validate-request";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PostgresError as PostgresErrorEnum } from "pg-error-enum";
import { PostgresError } from "postgres";
import { createUserSchema, loginUserSchema } from "./auth.schema";
import { jwtSign, verifyPassword } from "./auth.service";

export async function createUserHandler(req: Request, res: Response) {
  const { body } = validateRequest(createUserSchema, req);
  const { email, password, fullName, phone } = body;

  try {
    await createUser({ email, password, fullName, phone });

    res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
    });
  } catch (e) {
    const error = e as PostgresError;
    logger.error({ error }, "createUser: error creating user");

    if (error.code === PostgresErrorEnum.UNIQUE_VIOLATION) {
      httpError({
        res: res,
        message: "User already exists",
        code: StatusCodes.CONFLICT,
      });
      return;
    }

    httpError({
      res: res,
      message: "Error creating user",
      code: StatusCodes.BAD_REQUEST,
      cause: "Something went wrong",
    });
  }
}

export async function loginUserHandler(req: Request, res: Response) {
  const { body } = validateRequest(loginUserSchema, req);
  const { email, password } = body;

  try {
    const user = await findUserByEmail({ email });

    if (!user || !user?.password) {
      httpError({
        res,
        message: "invalid email or password",
        code: StatusCodes.UNAUTHORIZED,
      });
      return;
    }

    const isValidPassword = await verifyPassword({
      candidatePassword: password,
      hashedPassword: user.password,
    });

    if (!isValidPassword) {
      httpError({
        res,
        message: "invalid email or password",
        code: StatusCodes.UNAUTHORIZED,
        cause: "invalid password",
      });
      return;
    }
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwtSign(jwtPayload, "1h");
    const refreshToken = jwtSign(jwtPayload, "7d");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    res.json({ accessToken });
  } catch (error) {
    logger.error({ error }, "loginUser: error logging in user");

    httpError({
      res,
      message: "Error logging in user",
      code: StatusCodes.BAD_REQUEST,
    });
  }
}

export async function refreshTokenHandler(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: "No refresh token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as JwtPayload;

    const accessToken = jwtSign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      "1h"
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function logoutUserHandler(req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    message: "Logged out successfully",
  });
}
