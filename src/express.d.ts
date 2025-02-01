import { JwtPayload } from "jsonwebtoken";
import { ParamsDictionary, Query } from "./middlewares";
import { Request } from "express";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    userId: string;
  }
}

declare global {
  namespace Express {
    export interface Request {
      auth: JwtPayload;
    }
  }
}
