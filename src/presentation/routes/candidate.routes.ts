import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import z from "zod";

const candidateRouter = Router();

const candidateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi."),
  vision: z.string().min(1, "Visi wajib diisi."),
  mission: z.string().min(1, "Misi wajib diisi."),
  program: z.array(z.string().min(1, "Program tidak boleh kosong.")).min(1, "Minimal harus ada 1 program."),
  photoUrl: z.string().url("URL foto tidak valid.").optional().nullable(),
});

const candidateUpdateSchema = candidateSchema.partial();

// GET /api/candidates — Public endpoint
candidateRouter.get("/", CandidateController.getAll);

// GET /api/candidates/:id — Public endpoint
candidateRouter.get("/:id", CandidateController.getById);

// POST /api/candidates — Protected
candidateRouter.post("/", authMiddleware, validate(candidateSchema), CandidateController.create);

// PUT /api/candidates/:id — Protected
candidateRouter.put("/:id", authMiddleware, validate(candidateUpdateSchema), CandidateController.update);

// DELETE /api/candidates/:id — Protected
candidateRouter.delete("/:id", authMiddleware, CandidateController.delete);

export { candidateRouter };
