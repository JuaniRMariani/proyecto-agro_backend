import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBodyConditionScoreDto {
  @ApiProperty({ example: 3 })
  @IsNumber({}, { message: 'Score must be a number' })
  @IsNotEmpty({ message: 'Score is required' })
  @Min(1, { message: 'Score must be at least 1' })
  @Max(9, { message: 'Score cannot exceed 9' })
  score: number;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  @IsDateString({}, { message: 'Recorded date must be a valid date' })
  @IsNotEmpty({ message: 'Recorded date is required' })
  recordedAt: string;

  @ApiPropertyOptional({ example: 'Observation notes' })
  @IsOptional()
  @IsString({ message: 'Observation must be a string' })
  observation?: string;
}
