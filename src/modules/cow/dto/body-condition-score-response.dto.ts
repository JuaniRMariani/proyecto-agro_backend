import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BodyConditionScoreResponseDto {
  @ApiProperty({ example: '73583dc2-e179-4931-b495-1f85c1382152' })
  id: string;

  @ApiProperty({ example: 3 })
  score: number;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  recordedAt: Date;

  @ApiPropertyOptional({ example: 'Observation notes' })
  observation: string | null;

  @ApiProperty({ example: '165ab8ad-b614-4d2e-89a7-366aee70e94a' })
  cowId: string;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<BodyConditionScoreResponseDto>) {
    Object.assign(this, partial);
  }
}
