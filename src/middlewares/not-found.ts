import { NextFunction, Request, Response } from "express";

// catch 404 and forward to error handler
export function notFound(req: Request, res: Response, next: NextFunction) {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(err);
}
