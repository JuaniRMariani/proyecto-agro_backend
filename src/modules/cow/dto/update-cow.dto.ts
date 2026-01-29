import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCowDto {
  @ApiPropertyOptional({ example: '530' })
  @IsOptional()
  @IsString({ message: 'Tag number must be a string' })
  @MaxLength(50, { message: 'Tag number cannot exceed 50 characters' })
  tagNumber?: string;

  @ApiPropertyOptional({ example: 'Holstein' })
  @IsOptional()
  @IsString({ message: 'Breed must be a string' })
  @MaxLength(100, { message: 'Breed cannot exceed 100 characters' })
  breed?: string;

  @ApiPropertyOptional({ example: 900 })
  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be a positive number' })
  weight?: number;
}
