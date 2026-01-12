import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateBodyConditionScoreDto {
  @IsNumber({}, { message: 'Score must be a number' })
  @IsNotEmpty({ message: 'Score is required' })
  @Min(1, { message: 'Score must be at least 1' })
  @Max(9, { message: 'Score cannot exceed 9' })
  score: number;

  @IsDateString({}, { message: 'Recorded date must be a valid date' })
  @IsNotEmpty({ message: 'Recorded date is required' })
  recordedAt: string;

  @IsOptional()
  @IsString({ message: 'Observation must be a string' })
  observation?: string;
}
