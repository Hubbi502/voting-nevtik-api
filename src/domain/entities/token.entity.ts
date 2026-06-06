export interface VotingTokenEntity {
  id: number;
  token: string;
  isUsed: boolean;
  createdAt: Date;
  usedAt: Date | null;
}
