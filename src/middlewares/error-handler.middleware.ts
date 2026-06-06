import { Request, Response, NextFunction } from "express";

/**
 * Custom error class with HTTP status code.
 * Thrown anywhere in the app and caught by the centralized error handler.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Consistent API response format.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Centralized error handling middleware.
 * All errors pass through here for a consistent response format.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    } satisfies ApiResponse);
    return;
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    data: null,
  } satisfies ApiResponse);
};
