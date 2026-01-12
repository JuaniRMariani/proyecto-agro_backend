import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateCowDto {
  @IsString({ message: 'Tag number must be a string' })
  @IsNotEmpty({ message: 'Tag number is required' })
  @MaxLength(50, { message: 'Tag number cannot exceed 50 characters' })
  tagNumber: string;

  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be a positive number' })
  @IsOptional()
  weight: number;
}
