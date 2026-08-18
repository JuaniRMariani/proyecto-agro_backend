import type { BcsScore } from './bcs-score.constants';
import { BodyConditionScore } from './body-condition-score.entity';
import { ScoreSource } from './score-source.enum';

interface ProducerOverride {
  score: BcsScore;
  reason: string;
  userId: string;
  at: Date;
}

interface ProfessionalRecommendation {
  score: BcsScore;
  producerId: string;
  reviewId: string;
  at: Date;
}

export function applyProducerOverride(
  bcs: BodyConditionScore,
  override: ProducerOverride,
): void {
  bcs.score = override.score;
  bcs.scoreSource = ScoreSource.PRODUCER_OVERRIDE;
  bcs.overrideReason = override.reason;
  bcs.overriddenAt = override.at;
  bcs.overriddenByUserId = override.userId;
  bcs.appliedReviewId = null;
  bcs.syncAt = override.at;
}

export function revertToModelScore(bcs: BodyConditionScore, at: Date): void {
  bcs.score = bcs.modelScore;
  bcs.scoreSource = ScoreSource.MODEL;
  bcs.overrideReason = null;
  bcs.overriddenAt = null;
  bcs.overriddenByUserId = null;
  bcs.appliedReviewId = null;
  bcs.syncAt = at;
}

export function applyProfessionalScore(
  bcs: BodyConditionScore,
  recommendation: ProfessionalRecommendation,
): void {
  bcs.score = recommendation.score;
  bcs.scoreSource = ScoreSource.PROFESSIONAL_RECOMMENDATION;
  bcs.overrideReason = 'Sugerencia profesional aplicada por el productor';
  bcs.overriddenAt = recommendation.at;
  bcs.overriddenByUserId = recommendation.producerId;
  bcs.appliedReviewId = recommendation.reviewId;
  bcs.syncAt = recommendation.at;
}
