import { Router } from "express";
import z from "zod";
import { AuthController } from "../controllers/auth.controller.js";
import { AdminController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { rateLimiter } from "../../middlewares/rate-limiter.middleware.js";

const adminRouter = Router();

// ============================================
// Validation Schemas
// ============================================
const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

const generateTokensSchema = z.object({
  amount: z.number().int().min(1).max(500, "Maksimal 500 token per request."),
});

// ============================================
// Public Routes
// ============================================

// POST /api/admin/login — Rate limited to prevent brute force
adminRouter.post(
  "/login",
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10, message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." }),
  validate(loginSchema),
  AuthController.login
);

// ============================================
// Protected Routes (JWT Required)
// ============================================

// POST /api/admin/tokens/generate
adminRouter.post(
  "/tokens/generate",
  authMiddleware,
  validate(generateTokensSchema),
  AdminController.generateTokens
);

// GET /api/admin/tokens
adminRouter.get(
  "/tokens",
  authMiddleware,
  AdminController.getUnusedTokens
);

// DELETE /api/admin/tokens/:id
adminRouter.delete(
  "/tokens/:id",
  authMiddleware,
  AdminController.deleteToken
);

export { adminRouter };
