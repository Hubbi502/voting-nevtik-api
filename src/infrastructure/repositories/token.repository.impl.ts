import { TokenRepository } from "../../domain/repositories/token.repository.js";
import { VotingTokenEntity } from "../../domain/entities/token.entity.js";
import { AppError } from "../../middlewares/error-handler.middleware.js";
import { prisma } from "../database/prisma.js";

/** Raw DB row shape (snake_case column names from raw SQL) */
interface RawTokenRow {
  id: number;
  token: string;
  is_used: boolean;
  created_at: Date;
  used_at: Date | null;
}

export class TokenRepositoryImpl implements TokenRepository {
  async createMany(tokens: { token: string; email: string; name: string; updated_at: Date }[]): Promise<VotingTokenEntity[]> {
    const created = await prisma.votingToken.createManyAndReturn({
      data: tokens,
      skipDuplicates: true,
    });
    return created as unknown as VotingTokenEntity[];
  }

  async findByToken(token: string): Promise<VotingTokenEntity | null> {
    return prisma.votingToken.findUnique({
      where: { token },
    });
  }

  async findAllUnused(): Promise<VotingTokenEntity[]> {
    return prisma.votingToken.findMany({
      where: { isUsed: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteById(id: number): Promise<void> {
    await prisma.votingToken.delete({
      where: { id },
    });
  }

  /**
   * Atomic vote transaction using row-level locking (SELECT ... FOR UPDATE).
   * 
   * This approach prevents race conditions where two concurrent requests
   * with the same token could both pass the "is_used" check before either
   * updates it. By acquiring an exclusive row lock inside the transaction,
   * the second request is forced to wait until the first commits, at which
   * point it will see is_used = true and fail gracefully.
   * 
   * Why this is efficient:
   * - Only locks the specific token row, not the entire table
   * - The lock is held for a minimal duration (just the transaction)
   * - PostgreSQL's MVCC handles read concurrency efficiently
   */
  async voteTransaction(tokenId: number, candidateId: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Row-level lock on the specific token using raw SQL
      const lockedTokens = await tx.$queryRawUnsafe<RawTokenRow[]>(
        `SELECT * FROM "voting_tokens" WHERE "id" = $1 FOR UPDATE`,
        tokenId
      );

      const lockedToken = lockedTokens[0];

      if (!lockedToken || lockedToken.is_used) {
        throw new AppError(403, "Token sudah digunakan.");
      }

      // Mark token as used
      await tx.votingToken.update({
        where: { id: tokenId },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Increment vote count for the candidate
      await tx.candidate.update({
        where: { id: candidateId },
        data: { voteCount: { increment: 1 } },
      });
    });
  }
}
