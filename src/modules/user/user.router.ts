import { requiresAuth } from "@/middlewares/require-auth";
import express from "express";
import { getCurrentUserHandler } from "./user.controller";

export const userRouter = express.Router();

userRouter.get("/me", requiresAuth, getCurrentUserHandler);
