import { config } from "@/config";
import pino from "pino";

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  redact: ["DATABASE_URL", "JWT_SECRET", "COOKIE_SECRET"],
});
