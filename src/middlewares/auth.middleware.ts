import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./error-handler.middleware.js";

export interface AuthPayload {
  username: string;
  role: "admin";
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * Extracts and verifies the Bearer token from Authorization header.
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Token tidak ditemukan. Harap login terlebih dahulu.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.admin = decoded;
    next();
  } catch {
    throw new AppError(401, "Token tidak valid atau sudah kadaluarsa.");
  }
};
