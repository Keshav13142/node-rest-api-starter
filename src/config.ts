import "dotenv/config";
import { cleanEnv, num, str } from "envalid";

export const config = cleanEnv(process.env, {
  PORT: num({ default: 4000 }),
  HOST: str({ default: "localhost" }),
  DATABASE_URL: str(),
  JWT_SECRET: str({ default: "secret" }),
  COOKIE_SECRET: str({ default: "secret" }),
  LOG_LEVEL: str({ default: "info" }),
});
