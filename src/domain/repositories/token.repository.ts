import { VotingTokenEntity } from "../entities/token.entity.js";

export interface TokenRepository {
  createMany(tokens: string[]): Promise<VotingTokenEntity[]>;
  findByToken(token: string): Promise<VotingTokenEntity | null>;
  findAllUnused(): Promise<VotingTokenEntity[]>;
  deleteById(id: number): Promise<void>;
  /**
   * Atomically mark a token as used and increment candidate vote count.
   * Uses database transaction with row-level locking to prevent race conditions.
   */
  voteTransaction(tokenId: number, candidateId: number): Promise<void>;
}
