import { CandidateEntity } from "../entities/candidate.entity.js";

export type CreateCandidateDTO = Omit<CandidateEntity, "id" | "voteCount" | "createdAt" | "updatedAt">;
export type UpdateCandidateDTO = Partial<CreateCandidateDTO>;

export interface CandidateRepository {
  findAll(): Promise<CandidateEntity[]>;
  findById(id: number): Promise<CandidateEntity | null>;
  incrementVote(id: number): Promise<void>;
  create(data: CreateCandidateDTO): Promise<CandidateEntity>;
  update(id: number, data: UpdateCandidateDTO): Promise<CandidateEntity>;
  delete(id: number): Promise<void>;
}
