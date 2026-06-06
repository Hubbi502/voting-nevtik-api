import { Router } from "express";
import z from "zod";
import { VoteController } from "../controllers/vote.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { rateLimiter } from "../../middlewares/rate-limiter.middleware.js";

const voteRouter = Router();

// ============================================
// Validation Schema
// ============================================
const voteSchema = z.object({
  token: z.string().min(1, "Token voting wajib diisi."),
  candidate_id: z.number().int().positive("ID kandidat harus berupa angka positif."),
});

// POST /api/vote — Rate limited to prevent spam
voteRouter.post(
  "/",
  rateLimiter({ windowMs: 1 * 60 * 1000, maxRequests: 30, message: "Terlalu banyak percobaan voting. Coba lagi dalam 1 menit." }),
  validate(voteSchema),
  VoteController.submitVote
);

export { voteRouter };
