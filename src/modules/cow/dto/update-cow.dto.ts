import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class UpdateCowDto {
  @IsOptional()
  @IsString({ message: 'Tag number must be a string' })
  @MaxLength(50, { message: 'Tag number cannot exceed 50 characters' })
  tagNumber?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be a positive number' })
  weight?: number;
}
