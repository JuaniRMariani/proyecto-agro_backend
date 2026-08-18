import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BCS_SCORE_VALUES } from '../bcs-score.constants';
import type { BcsScore } from '../bcs-score.constants';

export class CreateBodyConditionScoreDto {
  @ApiProperty({ enum: BCS_SCORE_VALUES, example: '3.0-3.7' })
  @IsString({ message: 'Score must be a string' })
  @IsNotEmpty({ message: 'Score is required' })
  @IsIn(BCS_SCORE_VALUES, { message: 'El score BCS no es válido' })
  score: BcsScore;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  @IsDateString({}, { message: 'Recorded date must be a valid date' })
  @IsNotEmpty({ message: 'Recorded date is required' })
  recordedAt: string;

  @ApiPropertyOptional({ example: 'Observation notes' })
  @IsOptional()
  @IsString({ message: 'Observation must be a string' })
  observation?: string;
}
