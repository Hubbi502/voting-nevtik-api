import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { AppError } from "./error-handler.middleware.js";

/**
 * Generic Zod validation middleware.
 * Validates request body against a Zod schema.
 */
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Validasi gagal";
      throw new AppError(400, firstError as string);
    }

    req.body = result.data;
    next();
  };
}
