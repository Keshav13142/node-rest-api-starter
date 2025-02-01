import { requiresAuth } from "@/middlewares/require-auth";
import express from "express";
import {
  createUserHandler,
  loginUserHandler,
  logoutUserHandler,
  refreshTokenHandler,
} from "./auth.controller";

export const authRouter = express.Router();

authRouter.post("/login", loginUserHandler);
authRouter.post("/signup", createUserHandler);
authRouter.post("/refresh", requiresAuth, refreshTokenHandler);
authRouter.post("/logout", requiresAuth, logoutUserHandler);
