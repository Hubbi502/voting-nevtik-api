import { CandidateEntity } from "../entities/candidate.entity.js";

export interface CandidateRepository {
  findAll(): Promise<CandidateEntity[]>;
  findById(id: number): Promise<CandidateEntity | null>;
  incrementVote(id: number): Promise<void>;
}
