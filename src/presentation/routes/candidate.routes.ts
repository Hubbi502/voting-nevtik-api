import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller.js";

const candidateRouter = Router();

// GET /api/candidates — Public endpoint
candidateRouter.get("/", CandidateController.getAll);

export { candidateRouter };
