import { TokenRepository } from "../domain/repositories/token.repository.js";
import { CandidateRepository } from "../domain/repositories/candidate.repository.js";
import { AppError } from "../middlewares/error-handler.middleware.js";

export class VoteUseCase {
  constructor(
    private tokenRepository: TokenRepository,
    private candidateRepository: CandidateRepository
  ) {}

  /**
   * Submit a vote using a one-time-use token.
   * 
   * Flow:
   * 1. Validate the token exists → 404 if not found
   * 2. Check if token is already used → 403 if used
   * 3. Validate candidate exists → 404 if not found
   * 4. Execute atomic transaction:
   *    - SELECT ... FOR UPDATE (row lock on token)
   *    - Mark token as used
   *    - Increment candidate vote count
   * 5. Return success
   * 
   * The transaction uses Row Level Locking to prevent race conditions.
   * If two requests arrive simultaneously with the same token, the second
   * request will wait for the first to complete, then see is_used = true.
   */
  async submitVote(tokenString: string, candidateId: number): Promise<void> {
    // Step 1: Find the token
    const token = await this.tokenRepository.findByToken(tokenString);
    if (!token) {
      throw new AppError(404, "Token tidak ditemukan.");
    }

    // Step 2: Check if already used (fast-fail before locking)
    if (token.isUsed) {
      throw new AppError(403, "Token sudah digunakan. Setiap token hanya bisa digunakan satu kali.");
    }

    // Step 3: Validate candidate exists
    const candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new AppError(404, "Kandidat tidak ditemukan.");
    }

    // Step 4: Execute atomic vote transaction with row-level locking
    await this.tokenRepository.voteTransaction(token.id, candidateId);
  }
}
