import { Request, Response, NextFunction } from "express";
import { CandidateRepositoryImpl } from "../../infrastructure/repositories/candidate.repository.impl.js";

const candidateRepository = new CandidateRepositoryImpl();

export class CandidateController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidates = await candidateRepository.findAll();

      res.status(200).json({
        success: true,
        message: "Daftar kandidat berhasil diambil.",
        data: { candidates },
      });
    } catch (error) {
      next(error);
    }
  }
}
