import { BodyConditionScore } from '../../cow/body-condition-score.entity';
import { ProfessionalReview } from '../professional-review.entity';

export interface ProfessionalReviewFilters {
  producerId?: string;
  scoreId?: string;
}

export interface IProfessionalReviewRepository {
  findById(id: string): Promise<ProfessionalReview | null>;
  findReviewSubject(
    producerId: string,
    cowId: string,
    scoreId: string,
  ): Promise<BodyConditionScore | null>;
  findPublishedForProducer(
    producerId: string,
    scoreId?: string,
  ): Promise<ProfessionalReview[]>;
  findOwnByAuthor(
    authorProfessionalId: string,
    filters: ProfessionalReviewFilters,
  ): Promise<ProfessionalReview[]>;
  create(review: Partial<ProfessionalReview>): ProfessionalReview;
  save(review: ProfessionalReview): Promise<ProfessionalReview>;
}
