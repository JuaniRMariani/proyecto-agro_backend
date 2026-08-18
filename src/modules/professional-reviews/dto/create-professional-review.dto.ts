import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ProfessionalReviewStatus } from '../professional-review-status.enum';
import { BCS_SCORE_VALUES } from '../../cow/bcs-score.constants';
import type { BcsScore } from '../../cow/bcs-score.constants';

export class CreateProfessionalReviewDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'ProducerId debe ser un UUID válido' })
  producerId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'CowId debe ser un UUID válido' })
  cowId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'ScoreId debe ser un UUID válido' })
  scoreId: string;

  @ApiProperty({ example: 'Evaluación de condición corporal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'El animal presenta una condición estable.' })
  @IsString()
  @IsNotEmpty()
  assessment: string;

  @ApiProperty({
    example: 'Mantener el plan nutricional y revisar en 30 días.',
  })
  @IsString()
  @IsNotEmpty()
  recommendations: string;

  @ApiPropertyOptional({ enum: BCS_SCORE_VALUES, example: '3.0-3.7' })
  @IsOptional()
  @IsIn(BCS_SCORE_VALUES, { message: 'El score BCS sugerido no es válido' })
  suggestedScore?: BcsScore;

  @ApiPropertyOptional({ type: String, isArray: true, maxItems: 5 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    {
      each: true,
      message: 'Cada referencia debe ser una URL HTTP/HTTPS válida',
    },
  )
  referenceLinks?: string[];

  @ApiPropertyOptional({ type: String, isArray: true, maxItems: 5 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { each: true, message: 'Cada imagen debe ser una URL HTTP/HTTPS válida' },
  )
  exampleImageUrls?: string[];

  @ApiPropertyOptional({
    enum: ProfessionalReviewStatus,
    default: ProfessionalReviewStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProfessionalReviewStatus)
  status?: ProfessionalReviewStatus;
}
