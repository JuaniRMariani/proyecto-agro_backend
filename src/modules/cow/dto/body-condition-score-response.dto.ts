import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScoreSource } from '../score-source.enum';

export class BodyConditionScoreResponseDto {
  @ApiProperty({ example: '73583dc2-e179-4931-b495-1f85c1382152' })
  id: string;

  @ApiPropertyOptional({ example: 'client-uuid-123' })
  clientId: string | null;

  @ApiProperty({ example: '3.0-3.7' })
  score: string;

  @ApiProperty({ example: '3.0-3.7' })
  modelScore: string;

  @ApiProperty({ enum: ScoreSource, example: ScoreSource.MODEL })
  scoreSource: ScoreSource;

  @ApiPropertyOptional()
  overrideReason: string | null;

  @ApiPropertyOptional()
  overriddenAt: Date | null;

  @ApiPropertyOptional({ format: 'uuid' })
  overriddenByUserId: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  appliedReviewId: string | null;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  recordedAt: Date;

  @ApiPropertyOptional({ example: 'Observation notes' })
  observation: string | null;

  @ApiProperty({ example: '165ab8ad-b614-4d2e-89a7-366aee70e94a' })
  cowId: string;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../image/upload/...jpg',
    description: 'URL of the image in Cloudinary',
  })
  imageUrl: string | null;

  @ApiPropertyOptional({
    example: 'analysis_73583dc2-e179-4931-b495-1f85c1382152',
    description: 'Public ID of the image in Cloudinary',
  })
  imagePublicId: string | null;

  constructor(partial: Partial<BodyConditionScoreResponseDto>) {
    Object.assign(this, partial);
  }
}
