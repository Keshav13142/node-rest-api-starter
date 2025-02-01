import { config } from "@/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { logger } from "@/utils/logger";

const client = postgres(config.DATABASE_URL, {});

export const db = drizzle({ client, schema, casing: "snake_case" });

export async function pingDB() {
  return db.execute(sql`SELECT 1`);
}

export async function tearDownDB() {
  await client.end();
  logger.info("Database connection closed");
}
