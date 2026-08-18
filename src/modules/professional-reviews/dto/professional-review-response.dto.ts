import { ApiProperty } from '@nestjs/swagger';
import { AccountRole } from '../../user/account-role.enum';
import { ProfessionalReviewStatus } from '../professional-review-status.enum';

export class ReviewCowResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '530' })
  tagNumber: string;
}

export class ReviewScoreResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '3' })
  score: string;

  @ApiProperty({ example: '2026-08-18T18:00:00.000Z' })
  recordedAt: Date;
}

export class ReviewAuthorResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Dra. Ana Pérez' })
  fullName: string;

  @ApiProperty({ enum: AccountRole })
  role: AccountRole;
}

export class ProfessionalReviewResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  producerId: string;

  @ApiProperty({ type: ReviewCowResponseDto })
  cow: ReviewCowResponseDto;

  @ApiProperty({ type: ReviewScoreResponseDto })
  score: ReviewScoreResponseDto;

  @ApiProperty({ type: ReviewAuthorResponseDto })
  author: ReviewAuthorResponseDto;

  @ApiProperty()
  title: string;

  @ApiProperty()
  assessment: string;

  @ApiProperty()
  recommendations: string;

  @ApiProperty({ nullable: true, example: '3.0-3.7' })
  suggestedScore: string | null;

  @ApiProperty({ nullable: true })
  suggestionAppliedAt: Date | null;

  @ApiProperty({ type: String, isArray: true })
  referenceLinks: string[];

  @ApiProperty({ type: String, isArray: true })
  exampleImageUrls: string[];

  @ApiProperty({ enum: ProfessionalReviewStatus })
  status: ProfessionalReviewStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<ProfessionalReviewResponseDto>) {
    Object.assign(this, partial);
  }
}
