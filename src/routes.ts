import { authRouter } from "@/modules/auth/auth.router";
import { userRouter } from "@/modules/user/user.router";
import express, { Router } from "express";

const v1: Router = express.Router();

v1.use("/users", userRouter);
v1.use("/auth", authRouter);

export default v1;
