import { Request, Response, NextFunction } from "express";
import { VoteUseCase } from "../../usecases/vote.usecase.js";
import { TokenRepositoryImpl } from "../../infrastructure/repositories/token.repository.impl.js";
import { CandidateRepositoryImpl } from "../../infrastructure/repositories/candidate.repository.impl.js";

const voteUseCase = new VoteUseCase(
  new TokenRepositoryImpl(),
  new CandidateRepositoryImpl()
);

export class VoteController {
  static async submitVote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, candidate_id } = req.body;
      await voteUseCase.submitVote(token, candidate_id);

      res.status(200).json({
        success: true,
        message: "Vote berhasil dicatat. Terima kasih telah berpartisipasi!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
