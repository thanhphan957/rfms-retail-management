import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  const mongoErr = err as { code?: number; keyValue?: unknown };
  if (mongoErr.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value",
      errors: [{ value: mongoErr.keyValue }],
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: env.nodeEnv === "production" ? "Internal server error" : (err as Error).message,
  });
}
