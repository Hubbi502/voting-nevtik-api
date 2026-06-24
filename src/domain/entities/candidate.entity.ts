export interface CandidateEntity {
  id: number;
  name: string;
  vision: string;
  mission: string;
  program: string[];
  photoUrl: string | null;
  voteCount: number;
  createdAt: Date;
  updatedAt: Date;
}
