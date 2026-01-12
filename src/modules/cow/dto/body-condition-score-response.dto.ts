export class BodyConditionScoreResponseDto {
  id: string;
  score: number;
  recordedAt: Date;
  observation: string | null;
  cowId: string;
  createdAt: Date;

  constructor(partial: Partial<BodyConditionScoreResponseDto>) {
    Object.assign(this, partial);
  }
}
