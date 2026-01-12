import { Cow } from './cow.entity';
import { BodyConditionScore } from './body-condition-score.entity';
import { CowResponseDto } from './dto/cow-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';

export function cowMapperToResponseDto(cow: Cow): CowResponseDto | null {
  if (!cow) return null;

  return new CowResponseDto({
    id: cow.id,
    tagNumber: cow.tagNumber,
    weight: Number(cow.weight),
    bodyConditionScores: cow.bodyConditionScores?.map((bcs) =>
      bcsMapperToResponseDto(bcs),
    ).filter((bcs): bcs is BodyConditionScoreResponseDto => bcs !== null),
    createdAt: cow.createdAt,
    updatedAt: cow.updatedAt,
  });
}

export function bcsMapperToResponseDto(
  bcs: BodyConditionScore,
): BodyConditionScoreResponseDto | null {
  if (!bcs) return null;

  return new BodyConditionScoreResponseDto({
    id: bcs.id,
    score: Number(bcs.score),
    recordedAt: bcs.recordedAt,
    observation: bcs.observation,
    cowId: bcs.cowId,
    createdAt: bcs.createdAt,
  });
}
