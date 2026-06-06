import { CandidateRepository } from "../../domain/repositories/candidate.repository.js";
import { CandidateEntity } from "../../domain/entities/candidate.entity.js";
import { prisma } from "../database/prisma.js";

export class CandidateRepositoryImpl implements CandidateRepository {
  async findAll(): Promise<CandidateEntity[]> {
    return prisma.candidate.findMany({
      orderBy: { id: "asc" },
    });
  }

  async findById(id: number): Promise<CandidateEntity | null> {
    return prisma.candidate.findUnique({
      where: { id },
    });
  }

  async incrementVote(id: number): Promise<void> {
    await prisma.candidate.update({
      where: { id },
      data: { voteCount: { increment: 1 } },
    });
  }
}
