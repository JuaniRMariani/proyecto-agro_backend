import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from '../../common/auth/authenticated-request.interface';
import { BodyConditionScore } from '../cow/body-condition-score.entity';
import { Cow } from '../cow/cow.entity';
import { CowService } from '../cow/cow.service';
import { ScoreSource } from '../cow/score-source.enum';
import { ProfessionalAccessService } from '../professional-access/professional-access.service';
import { AccountRole } from '../user/account-role.enum';
import { User } from '../user/user.entity';
import type { IProfessionalReviewRepository } from './infra/professional-review.repository';
import { ProfessionalReviewStatus } from './professional-review-status.enum';
import { ProfessionalReview } from './professional-review.entity';
import { ProfessionalReviewService } from './professional-review.service';

type ReviewAccessService = Pick<
  ProfessionalAccessService,
  'assertActiveClientAccess'
>;
type ReviewCowService = Pick<CowService, 'applyProfessionalRecommendation'>;

const producerActor: AuthenticatedUser = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'producer@example.com',
  role: AccountRole.PRODUCER,
};
const professionalActor: AuthenticatedUser = {
  userId: '22222222-2222-4222-8222-222222222222',
  email: 'vet@example.com',
  role: AccountRole.VETERINARIAN,
};

function makeReview(
  status = ProfessionalReviewStatus.DRAFT,
): ProfessionalReview {
  const producer = new User();
  producer.id = producerActor.userId;
  producer.email = producerActor.email;
  producer.fullName = 'Productor';
  producer.role = producerActor.role;

  const author = new User();
  author.id = professionalActor.userId;
  author.email = professionalActor.email;
  author.fullName = 'Veterinaria';
  author.role = professionalActor.role;

  const cow = new Cow();
  cow.id = '33333333-3333-4333-8333-333333333333';
  cow.tagNumber = '530';
  cow.userId = producer.id;

  const score = new BodyConditionScore();
  score.id = '44444444-4444-4444-8444-444444444444';
  score.cowId = cow.id;
  score.cow = cow;
  score.modelScore = '2.2-2.9';
  score.score = '2.2-2.9';
  score.scoreSource = ScoreSource.MODEL;
  score.recordedAt = new Date('2026-08-18T17:00:00.000Z');
  score.appliedReviewId = null;
  score.overriddenAt = null;

  const review = new ProfessionalReview();
  review.id = '55555555-5555-4555-8555-555555555555';
  review.producerId = producer.id;
  review.producer = producer;
  review.cowId = cow.id;
  review.cow = cow;
  review.scoreId = score.id;
  review.score = score;
  review.authorProfessionalId = author.id;
  review.author = author;
  review.title = 'Evaluación';
  review.assessment = 'Condición estable';
  review.recommendations = 'Controlar en 30 días';
  review.suggestedScore = '3.0-3.7';
  review.referenceLinks = [];
  review.exampleImageUrls = [];
  review.status = status;
  review.createdAt = new Date('2026-08-18T18:00:00.000Z');
  review.updatedAt = new Date('2026-08-18T18:00:00.000Z');
  return review;
}

describe('ProfessionalReviewService', () => {
  let service: ProfessionalReviewService;
  let repository: jest.Mocked<IProfessionalReviewRepository>;
  let accessService: jest.Mocked<ReviewAccessService>;
  let cowService: jest.Mocked<ReviewCowService>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findReviewSubject: jest.fn(),
      findPublishedForProducer: jest.fn(),
      findOwnByAuthor: jest.fn(),
      create: jest.fn((partial: Partial<ProfessionalReview>) => {
        const review = makeReview();
        Object.assign(review, partial);
        return review;
      }),
      save: jest.fn((review: ProfessionalReview) => Promise.resolve(review)),
    };
    accessService = { assertActiveClientAccess: jest.fn() };
    cowService = { applyProfessionalRecommendation: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalReviewService,
        { provide: 'IProfessionalReviewRepository', useValue: repository },
        { provide: ProfessionalAccessService, useValue: accessService },
        { provide: CowService, useValue: cowService },
      ],
    }).compile();
    service = module.get<ProfessionalReviewService>(ProfessionalReviewService);
  });

  it('creates a review only after active access and subject ownership checks', async () => {
    const loaded = makeReview();
    repository.findReviewSubject.mockResolvedValue(loaded.score);
    repository.findById.mockResolvedValue(loaded);

    const result = await service.createReview(professionalActor, {
      producerId: loaded.producerId,
      cowId: loaded.cowId,
      scoreId: loaded.scoreId,
      title: loaded.title,
      assessment: loaded.assessment,
      recommendations: loaded.recommendations,
      suggestedScore: '3.0-3.7',
    });

    expect(accessService.assertActiveClientAccess).toHaveBeenCalledWith(
      professionalActor,
      producerActor.userId,
    );
    expect(repository.findReviewSubject.mock.calls).toContainEqual([
      producerActor.userId,
      loaded.cowId,
      loaded.scoreId,
    ]);
    expect(result.cow).toEqual({ id: loaded.cowId, tagNumber: '530' });
    expect(result.author.role).toBe(AccountRole.VETERINARIAN);
  });

  it('stops cross-tenant creation when no active grant exists', async () => {
    accessService.assertActiveClientAccess.mockRejectedValue(
      new NotFoundException('Cliente no encontrado'),
    );
    const review = makeReview();

    await expect(
      service.createReview(professionalActor, {
        producerId: review.producerId,
        cowId: review.cowId,
        scoreId: review.scoreId,
        title: review.title,
        assessment: review.assessment,
        recommendations: review.recommendations,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findReviewSubject.mock.calls).toHaveLength(0);
  });

  it('does not create a review for a score outside the producer cow', async () => {
    repository.findReviewSubject.mockResolvedValue(null);
    const review = makeReview();

    await expect(
      service.createReview(professionalActor, {
        producerId: review.producerId,
        cowId: review.cowId,
        scoreId: review.scoreId,
        title: review.title,
        assessment: review.assessment,
        recommendations: review.recommendations,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists only published reviews for the authenticated producer', async () => {
    repository.findPublishedForProducer.mockResolvedValue([
      makeReview(ProfessionalReviewStatus.PUBLISHED),
    ]);

    const result = await service.listReviews(producerActor, {});

    expect(repository.findPublishedForProducer.mock.calls).toContainEqual([
      producerActor.userId,
      undefined,
    ]);
    expect(result).toHaveLength(1);
  });

  it('does not let a producer query another tenant', async () => {
    await expect(
      service.listReviews(producerActor, {
        producerId: '66666666-6666-4666-8666-666666666666',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findPublishedForProducer.mock.calls).toHaveLength(0);
  });

  it('lists reviews scoped to the professional author', async () => {
    repository.findOwnByAuthor.mockResolvedValue([]);

    await service.listReviews(professionalActor, {
      producerId: producerActor.userId,
    });

    expect(repository.findOwnByAuthor.mock.calls).toContainEqual([
      professionalActor.userId,
      { producerId: producerActor.userId, scoreId: undefined },
    ]);
  });

  it('allows only the author to update or publish a review', async () => {
    const review = makeReview();
    repository.findById.mockResolvedValue(review);

    const result = await service.updateReview(professionalActor, review.id, {
      status: ProfessionalReviewStatus.PUBLISHED,
      recommendations: 'Nueva recomendación',
    });

    expect(result.status).toBe(ProfessionalReviewStatus.PUBLISHED);
    expect(accessService.assertActiveClientAccess).toHaveBeenCalledWith(
      professionalActor,
      review.producerId,
    );
    expect(result.recommendations).toBe('Nueva recomendación');
  });

  it('rejects edits after the producer revokes professional access', async () => {
    const review = makeReview();
    repository.findById.mockResolvedValue(review);
    accessService.assertActiveClientAccess.mockRejectedValue(
      new ForbiddenException('Access revoked'),
    );

    await expect(
      service.updateReview(professionalActor, review.id, {
        recommendations: 'Should not be saved',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save.mock.calls).toHaveLength(0);
  });

  it('keeps an applied suggested score immutable', async () => {
    const review = makeReview(ProfessionalReviewStatus.PUBLISHED);
    review.score.appliedReviewId = review.id;
    repository.findById.mockResolvedValue(review);

    await expect(
      service.updateReview(professionalActor, review.id, {
        suggestedScore: '3.8-5.0',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save.mock.calls).toHaveLength(0);
  });

  it('hides another author review', async () => {
    const review = makeReview();
    repository.findById.mockResolvedValue(review);
    const otherAuthor = {
      ...professionalActor,
      userId: '77777777-7777-4777-8777-777777777777',
    };

    await expect(
      service.updateReview(otherAuthor, review.id, { title: 'Intrusión' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('applies a published suggestion only for the owning producer', async () => {
    const review = makeReview(ProfessionalReviewStatus.PUBLISHED);
    repository.findById.mockResolvedValue(review);

    await service.applySuggestedScore(producerActor, review.id);

    expect(cowService.applyProfessionalRecommendation).toHaveBeenCalledWith(
      review.scoreId,
      producerActor.userId,
      review.suggestedScore,
      review.id,
    );
  });

  it('does not let a professional apply its own suggestion directly', async () => {
    await expect(
      service.applySuggestedScore(professionalActor, 'review-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.findById.mock.calls).toHaveLength(0);
  });

  it('reports when the suggestion was already applied', async () => {
    const review = makeReview(ProfessionalReviewStatus.PUBLISHED);
    review.score.appliedReviewId = review.id;
    review.score.overriddenAt = new Date('2026-08-18T19:00:00.000Z');
    repository.findPublishedForProducer.mockResolvedValue([review]);

    const [result] = await service.listReviews(producerActor, {});

    expect(result.suggestionAppliedAt).toEqual(review.score.overriddenAt);
  });
});
