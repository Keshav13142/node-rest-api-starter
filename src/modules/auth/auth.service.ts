import { config } from "@/config";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { logger } from "../../utils/logger";

export function jwtSign(
  jwtPayload: object,
  expiresIn: string | number
): string {
  return jwt.sign(jwtPayload, config.JWT_SECRET, {
    expiresIn,
  });
}

export async function verifyPassword({
  candidatePassword,
  hashedPassword,
}: {
  candidatePassword: string;
  hashedPassword: string;
}) {
  try {
    const result = await argon2.verify(hashedPassword, candidatePassword);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ message }, "verifyPassword: failed to verify password");
    throw error;
  }
}
