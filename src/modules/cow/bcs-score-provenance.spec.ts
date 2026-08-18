import { BodyConditionScore } from './body-condition-score.entity';
import {
  applyProducerOverride,
  applyProfessionalScore,
  revertToModelScore,
} from './bcs-score-provenance';
import { ScoreSource } from './score-source.enum';

function makeScore(): BodyConditionScore {
  const bcs = new BodyConditionScore();
  bcs.modelScore = '2.2-2.9';
  bcs.score = bcs.modelScore;
  bcs.scoreSource = ScoreSource.MODEL;
  bcs.overrideReason = null;
  bcs.overriddenAt = null;
  bcs.overriddenByUserId = null;
  bcs.appliedReviewId = null;
  bcs.syncAt = null;
  return bcs;
}

describe('BCS score provenance', () => {
  const now = new Date('2026-08-18T18:00:00.000Z');

  it('preserves modelScore when a producer overrides the effective score', () => {
    const bcs = makeScore();

    applyProducerOverride(bcs, {
      score: '3.0-3.7',
      reason: 'Evaluación visual',
      userId: 'user-1',
      at: now,
    });

    expect(bcs.modelScore).toBe('2.2-2.9');
    expect(bcs.score).toBe('3.0-3.7');
    expect(bcs.scoreSource).toBe(ScoreSource.PRODUCER_OVERRIDE);
  });

  it('restores the immutable modelScore and clears override metadata', () => {
    const bcs = makeScore();
    applyProducerOverride(bcs, {
      score: '3.0-3.7',
      reason: 'Evaluación visual',
      userId: 'user-1',
      at: now,
    });

    revertToModelScore(bcs, now);

    expect(bcs.modelScore).toBe('2.2-2.9');
    expect(bcs.score).toBe('2.2-2.9');
    expect(bcs.scoreSource).toBe(ScoreSource.MODEL);
    expect(bcs.overrideReason).toBeNull();
    expect(bcs.appliedReviewId).toBeNull();
  });

  it('applies a professional score without changing the model decision', () => {
    const bcs = makeScore();

    applyProfessionalScore(bcs, {
      score: '1.0-2.1',
      producerId: 'user-1',
      reviewId: 'review-1',
      at: now,
    });

    expect(bcs.modelScore).toBe('2.2-2.9');
    expect(bcs.score).toBe('1.0-2.1');
    expect(bcs.scoreSource).toBe(ScoreSource.PROFESSIONAL_RECOMMENDATION);
    expect(bcs.appliedReviewId).toBe('review-1');
  });
});
