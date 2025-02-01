import type { Request, Response } from "express";
import { getUserById } from "./user.service";

export async function getCurrentUserHandler(req: Request, res: Response) {
  const user = await getUserById(req.auth.userId);
  res.json(user);
}
