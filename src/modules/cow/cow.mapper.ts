import { Cow } from './cow.entity';
import { BodyConditionScore } from './body-condition-score.entity';
import { CowOwnershipHistory } from './cow-ownership-history.entity';
import { CowResponseDto } from './dto/cow-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';
import { CowOwnershipHistoryResponseDto } from './dto/cow-ownership-history-response.dto';

export function cowMapperToResponseDto(cow: Cow): CowResponseDto | null {
  if (!cow) return null;

  return new CowResponseDto({
    id: cow.id,
    tagNumber: cow.tagNumber,
    breed: cow.breed,
    weight: Number(cow.weight),
    userId: cow.userId,
    bodyConditionScores: cow.bodyConditionScores
      ?.filter((bcs) => !bcs.deleted)
      .map((bcs) => bcsMapperToResponseDto(bcs))
      .filter((bcs): bcs is BodyConditionScoreResponseDto => bcs !== null),
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
    imageUrl: bcs.imageUrl,
    imagePublicId: bcs.imagePublicId,
  });
}

export function ownershipHistoryMapperToResponseDto(
  history: CowOwnershipHistory,
): CowOwnershipHistoryResponseDto | null {
  if (!history) return null;

  return new CowOwnershipHistoryResponseDto({
    id: history.id,
    cowId: history.cowId,
    previousUserId: history.previousUserId,
    newUserId: history.newUserId,
    reason: history.reason,
    transferredAt: history.transferredAt,
  });
}
