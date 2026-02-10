import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBodyConditionScoreDto {
  @ApiProperty({ example: '3' })
  @IsString({ message: 'Score must be a string' })
  @IsNotEmpty({ message: 'Score is required' })
  score: string;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  @IsDateString({}, { message: 'Recorded date must be a valid date' })
  @IsNotEmpty({ message: 'Recorded date is required' })
  recordedAt: string;

  @ApiPropertyOptional({ example: 'Observation notes' })
  @IsOptional()
  @IsString({ message: 'Observation must be a string' })
  observation?: string;
}
