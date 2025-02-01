import { config } from "@/config";
import { errorHandler } from "@/middlewares/error-handler";
import { notFound } from "@/middlewares/not-found";
import v1 from "@/routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

export function createExpressApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser(config.COOKIE_SECRET));

  app.get("/health-check", (_, res) => {
    res.status(200).end();
  });
  app.head("/health-check", (_, res) => {
    res.status(200).end();
  });

  app.use(morgan("dev"));
  app.use(helmet());
  app.use(cors());

  app.use("/api/v1", v1);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
