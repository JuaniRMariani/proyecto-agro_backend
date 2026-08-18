import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-request.interface';
import { ProfessionalAccessService } from '../professional-access/professional-access.service';
import {
  AccountRole,
  isProfessionalAccountRole,
} from '../user/account-role.enum';
import { CreateProfessionalReviewDto } from './dto/create-professional-review.dto';
import { ListProfessionalReviewsQueryDto } from './dto/list-professional-reviews-query.dto';
import { ProfessionalReviewResponseDto } from './dto/professional-review-response.dto';
import { UpdateProfessionalReviewDto } from './dto/update-professional-review.dto';
import type { IProfessionalReviewRepository } from './infra/professional-review.repository';
import { ProfessionalReviewStatus } from './professional-review-status.enum';
import { ProfessionalReview } from './professional-review.entity';
import { CowService } from '../cow/cow.service';
import { BodyConditionScoreResponseDto } from '../cow/dto/body-condition-score-response.dto';

@Injectable()
export class ProfessionalReviewService {
  constructor(
    @Inject('IProfessionalReviewRepository')
    private readonly reviewRepository: IProfessionalReviewRepository,
    private readonly professionalAccessService: ProfessionalAccessService,
    private readonly cowService: CowService,
  ) {}

  async createReview(
    actor: AuthenticatedUser,
    createDto: CreateProfessionalReviewDto,
  ): Promise<ProfessionalReviewResponseDto> {
    await this.professionalAccessService.assertActiveClientAccess(
      actor,
      createDto.producerId,
    );
    const subject = await this.reviewRepository.findReviewSubject(
      createDto.producerId,
      createDto.cowId,
      createDto.scoreId,
    );
    if (!subject) {
      throw new NotFoundException('Resultado no encontrado');
    }

    const review = this.reviewRepository.create({
      producerId: createDto.producerId,
      cowId: createDto.cowId,
      scoreId: createDto.scoreId,
      authorProfessionalId: actor.userId,
      title: createDto.title,
      assessment: createDto.assessment,
      recommendations: createDto.recommendations,
      suggestedScore: createDto.suggestedScore ?? null,
      referenceLinks: createDto.referenceLinks ?? [],
      exampleImageUrls: createDto.exampleImageUrls ?? [],
      status: createDto.status ?? ProfessionalReviewStatus.DRAFT,
    });
    const savedReview = await this.reviewRepository.save(review);
    const loadedReview = await this.reviewRepository.findById(savedReview.id);
    if (!loadedReview) {
      throw new InternalServerErrorException(
        'No fue posible recuperar la devolución profesional',
      );
    }
    return this.mapReview(loadedReview);
  }

  async listReviews(
    actor: AuthenticatedUser,
    query: ListProfessionalReviewsQueryDto,
  ): Promise<ProfessionalReviewResponseDto[]> {
    if (actor.role === AccountRole.PRODUCER) {
      if (query.producerId && query.producerId !== actor.userId) {
        throw new NotFoundException('Productor no encontrado');
      }
      const reviews = await this.reviewRepository.findPublishedForProducer(
        actor.userId,
        query.scoreId,
      );
      return reviews.map((review) => this.mapReview(review));
    }

    this.assertProfessional(actor);
    const reviews = await this.reviewRepository.findOwnByAuthor(actor.userId, {
      producerId: query.producerId,
      scoreId: query.scoreId,
    });
    return reviews.map((review) => this.mapReview(review));
  }

  async updateReview(
    actor: AuthenticatedUser,
    reviewId: string,
    updateDto: UpdateProfessionalReviewDto,
  ): Promise<ProfessionalReviewResponseDto> {
    this.assertProfessional(actor);
    const review = await this.reviewRepository.findById(reviewId);
    if (!review || review.authorProfessionalId !== actor.userId) {
      throw new NotFoundException('Devolución profesional no encontrada');
    }

    await this.professionalAccessService.assertActiveClientAccess(
      actor,
      review.producerId,
    );

    const suggestionWasApplied = review.score.appliedReviewId === review.id;
    if (
      suggestionWasApplied &&
      updateDto.suggestedScore !== undefined &&
      updateDto.suggestedScore !== review.suggestedScore
    ) {
      throw new ConflictException(
        'The suggested score cannot change after it was applied',
      );
    }
    if (
      suggestionWasApplied &&
      updateDto.status !== undefined &&
      updateDto.status !== ProfessionalReviewStatus.PUBLISHED
    ) {
      throw new ConflictException('An applied review must remain published');
    }

    this.applyUpdate(review, updateDto);
    const savedReview = await this.reviewRepository.save(review);
    return this.mapReview(savedReview);
  }

  async applySuggestedScore(
    actor: AuthenticatedUser,
    reviewId: string,
  ): Promise<BodyConditionScoreResponseDto> {
    if (actor.role !== AccountRole.PRODUCER) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta productora',
      );
    }
    const review = await this.reviewRepository.findById(reviewId);
    if (
      !review ||
      review.producerId !== actor.userId ||
      review.status !== ProfessionalReviewStatus.PUBLISHED
    ) {
      throw new NotFoundException('Devolución profesional no encontrada');
    }
    if (!review.suggestedScore) {
      throw new NotFoundException(
        'La devolución no contiene un score sugerido',
      );
    }
    return this.cowService.applyProfessionalRecommendation(
      review.scoreId,
      actor.userId,
      review.suggestedScore,
      review.id,
    );
  }

  private applyUpdate(
    review: ProfessionalReview,
    updateDto: UpdateProfessionalReviewDto,
  ): void {
    if (updateDto.title !== undefined) review.title = updateDto.title;
    if (updateDto.assessment !== undefined) {
      review.assessment = updateDto.assessment;
    }
    if (updateDto.recommendations !== undefined) {
      review.recommendations = updateDto.recommendations;
    }
    if (updateDto.suggestedScore !== undefined) {
      review.suggestedScore = updateDto.suggestedScore;
    }
    if (updateDto.referenceLinks !== undefined) {
      review.referenceLinks = updateDto.referenceLinks;
    }
    if (updateDto.exampleImageUrls !== undefined) {
      review.exampleImageUrls = updateDto.exampleImageUrls;
    }
    if (updateDto.status !== undefined) review.status = updateDto.status;
  }

  private assertProfessional(actor: AuthenticatedUser): void {
    if (!isProfessionalAccountRole(actor.role)) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta veterinaria o profesional',
      );
    }
  }

  private mapReview(review: ProfessionalReview): ProfessionalReviewResponseDto {
    return new ProfessionalReviewResponseDto({
      id: review.id,
      producerId: review.producerId,
      cow: {
        id: review.cow.id,
        tagNumber: review.cow.tagNumber,
      },
      score: {
        id: review.score.id,
        score: review.score.score,
        recordedAt: review.score.recordedAt,
      },
      author: {
        id: review.author.id,
        fullName: review.author.fullName,
        role: review.author.role,
      },
      title: review.title,
      assessment: review.assessment,
      recommendations: review.recommendations,
      suggestedScore: review.suggestedScore,
      suggestionAppliedAt:
        review.score.appliedReviewId === review.id
          ? review.score.overriddenAt
          : null,
      referenceLinks: review.referenceLinks,
      exampleImageUrls: review.exampleImageUrls,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }
}
