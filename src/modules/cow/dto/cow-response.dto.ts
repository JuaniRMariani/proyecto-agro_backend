import { BodyConditionScoreResponseDto } from './body-condition-score-response.dto';

export class CowResponseDto {
  id: string;
  tagNumber: string;
  weight: number;
  userId: string;
  bodyConditionScores?: BodyConditionScoreResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CowResponseDto>) {
    Object.assign(this, partial);
  }
}
