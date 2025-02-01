import { config } from "@/config";
import { pingDB, tearDownDB } from "@/db";
import { createExpressApp } from "@/server";
import { logger } from "@/utils/logger";
import { Server } from "node:http";

const { PORT, HOST } = config;

let server: Server | undefined;

async function main() {
  try {
    await pingDB();
    logger.info("Database Connected");
  } catch (e) {
    logger.error(e, "Database Ping Failed");
    process.exit(1);
  }

  const app = createExpressApp();

  try {
    server = app.listen({ port: PORT, host: HOST });
    console.log(`
      ################################################
      🛡️  Server listening on port: ${config.PORT} 🛡️
      ################################################
    `);
  } catch (err) {
    logger.error(err);
    await tearDownDB();
    logger.info("Database connection closed.");
    process.exit(1);
  }

  // Throws an error cause pino is trying to acess the proxy object??
  logger.info({ ...config }, "Using Config");
}

function shutDownServer() {
  if (server) {
    server.close(() => {
      logger.info("Shutting down server");
      tearDownDB();
      logger.info("Server closed");
    });
  }
}

process.on("uncaughtException", function (err) {
  logger.error(err);
  shutDownServer();
  process.exit(1);
});

process.on("SIGTERM", () => {
  logger.warn("SIGTERM signal received: closing HTTP server");
  shutDownServer();
});

main();
