import { NotFoundException } from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import { BodyConditionScore } from '../body-condition-score.entity';
import { Cow } from '../cow.entity';
import { CowOwnershipHistory } from '../cow-ownership-history.entity';
import { ScoreSource } from '../score-source.enum';
import { CowTypeOrmRepository } from './cow.typeorm.repository';

describe('CowTypeOrmRepository BCS ownership', () => {
  const ownerId = '11111111-1111-4111-8111-111111111111';
  const otherUserId = '22222222-2222-4222-8222-222222222222';
  const bcsId = '33333333-3333-4333-8333-333333333333';

  let findOne: jest.Mock;
  let findOwnedCow: jest.Mock;
  let create: jest.Mock;
  let save: jest.Mock;
  let repository: CowTypeOrmRepository;

  beforeEach(() => {
    findOne = jest.fn();
    findOwnedCow = jest.fn();
    create = jest.fn((record: Partial<BodyConditionScore>) =>
      Object.assign(new BodyConditionScore(), record),
    );
    save = jest.fn();

    const cowRepository = {
      findOne: findOwnedCow,
    } as unknown as Repository<Cow>;
    const bcsRepository = {
      findOne,
      create,
      save,
    } as unknown as Repository<BodyConditionScore>;
    const historyRepository = {} as Repository<CowOwnershipHistory>;
    const dataSource = {} as DataSource;

    repository = new CowTypeOrmRepository(
      cowRepository,
      bcsRepository,
      historyRepository,
      dataSource,
    );
  });

  it('hides a score owned by another producer when overriding it', async () => {
    const cow = new Cow();
    cow.userId = ownerId;
    const bcs = new BodyConditionScore();
    bcs.id = bcsId;
    bcs.cow = cow;
    findOne.mockResolvedValue(bcs);

    await expect(
      repository.overrideBcs(bcsId, otherUserId, '3.0-3.7', 'Correction'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(save).not.toHaveBeenCalled();
  });

  it('keeps modelScore unchanged when its owner applies an override', async () => {
    const cow = new Cow();
    cow.userId = ownerId;
    const bcs = new BodyConditionScore();
    bcs.id = bcsId;
    bcs.cow = cow;
    bcs.modelScore = '2.2-2.9';
    bcs.score = '2.2-2.9';
    findOne.mockResolvedValue(bcs);
    save.mockImplementation((record: BodyConditionScore) => record);

    const result = await repository.overrideBcs(
      bcsId,
      ownerId,
      '3.0-3.7',
      'Visual reassessment',
    );

    expect(result.modelScore).toBe('2.2-2.9');
    expect(result.score).toBe('3.0-3.7');
    expect(save).toHaveBeenCalledWith(bcs);
  });

  it('round-trips an offline producer override without changing modelScore', async () => {
    const cow = new Cow();
    cow.id = '44444444-4444-4444-8444-444444444444';
    cow.userId = ownerId;
    findOwnedCow.mockResolvedValue(cow);

    const bcs = new BodyConditionScore();
    bcs.id = bcsId;
    bcs.clientId = '55555555-5555-4555-8555-555555555555';
    bcs.cow = cow;
    bcs.modelScore = '2.2-2.9';
    bcs.score = '2.2-2.9';
    bcs.scoreSource = ScoreSource.MODEL;
    bcs.recordedAt = new Date('2026-08-18T17:00:00.000Z');
    findOne.mockResolvedValue(bcs);
    save.mockImplementation((record: BodyConditionScore) => record);

    const result = await repository.syncBodyConditionScore(cow.id, ownerId, {
      cowTagNumber: '530',
      clientId: bcs.clientId,
      modelScore: '3.8-5.0',
      score: '3.0-3.7',
      scoreSource: ScoreSource.PRODUCER_OVERRIDE,
      overrideReason: 'Offline visual reassessment',
      overriddenAt: 1787072400000,
    });

    expect(result.created).toBe(false);
    expect(result.bcs.modelScore).toBe('2.2-2.9');
    expect(result.bcs.score).toBe('3.0-3.7');
    expect(result.bcs.scoreSource).toBe(ScoreSource.PRODUCER_OVERRIDE);
    expect(result.bcs.overriddenByUserId).toBe(ownerId);
    expect(result.bcs.appliedReviewId).toBeNull();
  });

  it('restores the model score and clears override metadata through sync', async () => {
    const cow = new Cow();
    cow.id = '44444444-4444-4444-8444-444444444444';
    cow.userId = ownerId;
    findOwnedCow.mockResolvedValue(cow);

    const bcs = new BodyConditionScore();
    bcs.id = bcsId;
    bcs.clientId = '55555555-5555-4555-8555-555555555555';
    bcs.cow = cow;
    bcs.modelScore = '2.2-2.9';
    bcs.score = '3.0-3.7';
    bcs.scoreSource = ScoreSource.PRODUCER_OVERRIDE;
    bcs.overrideReason = 'Previous override';
    bcs.overriddenAt = new Date();
    bcs.overriddenByUserId = ownerId;
    bcs.appliedReviewId = null;
    bcs.recordedAt = new Date('2026-08-18T17:00:00.000Z');
    findOne.mockResolvedValue(bcs);
    save.mockImplementation((record: BodyConditionScore) => record);

    const result = await repository.syncBodyConditionScore(cow.id, ownerId, {
      cowTagNumber: '530',
      clientId: bcs.clientId,
      score: '3.0-3.7',
      scoreSource: ScoreSource.MODEL,
    });

    expect(result.bcs.score).toBe('2.2-2.9');
    expect(result.bcs.modelScore).toBe('2.2-2.9');
    expect(result.bcs.scoreSource).toBe(ScoreSource.MODEL);
    expect(result.bcs.overrideReason).toBeNull();
    expect(result.bcs.overriddenAt).toBeNull();
    expect(result.bcs.overriddenByUserId).toBeNull();
    expect(result.bcs.appliedReviewId).toBeNull();
  });

  it('creates a valid producer override with the server actor as author', async () => {
    const cow = new Cow();
    cow.id = '44444444-4444-4444-8444-444444444444';
    cow.userId = ownerId;
    findOwnedCow.mockResolvedValue(cow);
    findOne.mockResolvedValue(null);
    save.mockImplementation((record: BodyConditionScore) => record);

    const result = await repository.syncBodyConditionScore(cow.id, ownerId, {
      cowTagNumber: '530',
      clientId: '55555555-5555-4555-8555-555555555555',
      modelScore: '2.2-2.9',
      score: '3.0-3.7',
      scoreSource: ScoreSource.PRODUCER_OVERRIDE,
      overrideReason: 'Offline correction',
    });

    expect(result.created).toBe(true);
    expect(result.bcs.modelScore).toBe('2.2-2.9');
    expect(result.bcs.score).toBe('3.0-3.7');
    expect(result.bcs.overriddenByUserId).toBe(ownerId);
    expect(result.bcs.appliedReviewId).toBeNull();
  });
});
