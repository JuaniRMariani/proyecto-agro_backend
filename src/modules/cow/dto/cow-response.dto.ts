import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BodyConditionScoreResponseDto } from './body-condition-score-response.dto';

export class CowResponseDto {
  @ApiProperty({ example: '165ab8ad-b614-4d2e-89a7-366aee70e94a' })
  id: string;

  @ApiProperty({ example: '530' })
  tagNumber: string;

  @ApiPropertyOptional({ example: 'Holstein' })
  breed?: string;

  @ApiProperty({ example: 900 })
  weight: number;

  @ApiProperty({ example: '3b6efa53-e23f-4bda-adf5-29ae714acac4' })
  userId: string;

  @ApiPropertyOptional({ type: BodyConditionScoreResponseDto, isArray: true })
  bodyConditionScores?: BodyConditionScoreResponseDto[];

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<CowResponseDto>) {
    Object.assign(this, partial);
  }
}
