import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/utils/logger";
import argon2 from "argon2";
import { eq, InferInsertModel } from "drizzle-orm";

export async function createUser(values: InferInsertModel<typeof users>) {
  try {
    const hashedPassword = await argon2.hash(values.password);

    const payload = {
      ...values,
      password: hashedPassword,
    };

    const result = await db.insert(users).values(payload).returning({
      id: users.id,
      email: users.email,
    });

    return result[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ message }, "createUser: failed to create user");
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        password: false,
      },
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ message, userId }, "getUserById: failed to get user");
    throw error;
  }
}

export async function findUserByEmail({ email }: { email: string }) {
  try {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ message, email }, "findUserByEmail: failed to find user");
    throw error;
  }
}
