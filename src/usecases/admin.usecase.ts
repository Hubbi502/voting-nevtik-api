import crypto from "crypto";
import { TokenRepository } from "../domain/repositories/token.repository.js";
import { VotingTokenEntity } from "../domain/entities/token.entity.js";
import { AppError } from "../middlewares/error-handler.middleware.js";

export class AdminUseCase {
  constructor(private tokenRepository: TokenRepository) {}

  /**
   * Generate unique random voting tokens.
   * Each token is a 12-character uppercase alphanumeric string.
   */
  async generateTokens(emails: string[]): Promise<VotingTokenEntity[]> {
    if (emails.length < 1 || emails.length > 500) {
      throw new AppError(400, "Jumlah token harus antara 1 dan 500.");
    }

    const tokenPayloads: { token: string; email: string; name: string; updated_at: Date }[] = [];

    for (const email of emails) {
      const token = crypto.randomBytes(6).toString("hex").toUpperCase();
      tokenPayloads.push({
        token,
        email,
        name: email.split("@")[0], // Default name from email
        updated_at: new Date()
      });
    }

    return this.tokenRepository.createMany(tokenPayloads);
  }

  /**
   * Get all unused (available) tokens.
   */
  async getUnusedTokens(): Promise<VotingTokenEntity[]> {
    return this.tokenRepository.findAllUnused();
  }

  /**
   * Delete a specific token by ID.
   */
  async deleteToken(id: number): Promise<void> {
    try {
      await this.tokenRepository.deleteById(id);
    } catch {
      throw new AppError(404, "Token tidak ditemukan.");
    }
  }
}
