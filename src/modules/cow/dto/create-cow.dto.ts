import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCowDto {
  @ApiProperty({ example: '530' })
  @IsString({ message: 'Tag number must be a string' })
  @IsNotEmpty({ message: 'Tag number is required' })
  @MaxLength(50, { message: 'Tag number cannot exceed 50 characters' })
  tagNumber: string;

  @ApiPropertyOptional({ example: 900 })
  @IsNumber({}, { message: 'Weight must be a number' })
  @IsPositive({ message: 'Weight must be a positive number' })
  @IsOptional()
  weight?: number;
}
