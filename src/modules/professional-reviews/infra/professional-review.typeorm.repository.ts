import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BodyConditionScore } from '../../cow/body-condition-score.entity';
import { ProfessionalReviewStatus } from '../professional-review-status.enum';
import { ProfessionalReview } from '../professional-review.entity';
import {
  IProfessionalReviewRepository,
  ProfessionalReviewFilters,
} from './professional-review.repository';

const reviewRelations = {
  author: true,
  cow: true,
  score: true,
} as const;

@Injectable()
export class ProfessionalReviewTypeOrmRepository implements IProfessionalReviewRepository {
  constructor(
    @InjectRepository(ProfessionalReview)
    private readonly reviewRepository: Repository<ProfessionalReview>,
    @InjectRepository(BodyConditionScore)
    private readonly scoreRepository: Repository<BodyConditionScore>,
  ) {}

  findById(id: string): Promise<ProfessionalReview | null> {
    return this.reviewRepository.findOne({
      where: { id },
      relations: reviewRelations,
    });
  }

  findReviewSubject(
    producerId: string,
    cowId: string,
    scoreId: string,
  ): Promise<BodyConditionScore | null> {
    return this.scoreRepository.findOne({
      where: {
        id: scoreId,
        cowId,
        deleted: false,
        cow: { userId: producerId, deleted: false },
      },
      relations: { cow: true },
    });
  }

  findPublishedForProducer(
    producerId: string,
    scoreId?: string,
  ): Promise<ProfessionalReview[]> {
    const where: FindOptionsWhere<ProfessionalReview> = {
      producerId,
      status: ProfessionalReviewStatus.PUBLISHED,
    };
    if (scoreId) {
      where.scoreId = scoreId;
    }
    return this.reviewRepository.find({
      where,
      relations: reviewRelations,
      order: { updatedAt: 'DESC' },
    });
  }

  findOwnByAuthor(
    authorProfessionalId: string,
    filters: ProfessionalReviewFilters,
  ): Promise<ProfessionalReview[]> {
    const where: FindOptionsWhere<ProfessionalReview> = {
      authorProfessionalId,
    };
    if (filters.producerId) {
      where.producerId = filters.producerId;
    }
    if (filters.scoreId) {
      where.scoreId = filters.scoreId;
    }
    return this.reviewRepository.find({
      where,
      relations: reviewRelations,
      order: { updatedAt: 'DESC' },
    });
  }

  create(review: Partial<ProfessionalReview>): ProfessionalReview {
    return this.reviewRepository.create(review);
  }

  save(review: ProfessionalReview): Promise<ProfessionalReview> {
    return this.reviewRepository.save(review);
  }
}
