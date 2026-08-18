import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BCS_SCORE_VALUES } from '../bcs-score.constants';
import type { BcsScore } from '../bcs-score.constants';

export class OverrideBodyConditionScoreDto {
  @ApiProperty({ enum: BCS_SCORE_VALUES, example: '3.0-3.7' })
  @IsIn(BCS_SCORE_VALUES, { message: 'El score BCS no es válido' })
  score: BcsScore;

  @ApiProperty({ example: 'Corrección luego de evaluación visual en campo.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
