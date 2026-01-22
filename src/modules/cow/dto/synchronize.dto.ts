import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SyncCowDto {
  @ApiPropertyOptional({ example: '530' })
  @IsString({ message: 'Tag number must be a string' })
  @IsNotEmpty({ message: 'Tag number is required' })
  tagNumber: string;

  @ApiPropertyOptional({ example: 900 })
  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  weight?: number;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'UpdatedAt must be a number (epoch ms)' })
  updatedAt?: number;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'CreatedAt must be a number (epoch ms)' })
  createdAt?: number;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'SyncAt must be a number (epoch ms)' })
  syncAt?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({ message: 'Deleted must be a boolean' })
  deleted?: boolean;
}

export class SyncBodyConditionScoreDto {
  @ApiPropertyOptional({ example: '73583dc2-e179-4931-b495-1f85c1382152' })
  @IsOptional()
  @IsUUID('4', { message: 'Id must be a valid UUID' })
  id?: string;

  @ApiPropertyOptional({ example: '530' })
  @IsString({ message: 'Cow tag number must be a string' })
  @IsNotEmpty({ message: 'Cow tag number is required' })
  cowTagNumber: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber({}, { message: 'Score must be a number' })
  score?: number;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'RecordedAt must be a number (epoch ms)' })
  recordedAt?: number;

  @ApiPropertyOptional({ example: 'Observation' })
  @IsOptional()
  @IsString({ message: 'Observation must be a string' })
  observation?: string;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'UpdatedAt must be a number (epoch ms)' })
  updatedAt?: number;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'CreatedAt must be a number (epoch ms)' })
  createdAt?: number;

  @ApiPropertyOptional({ example: 1769017035502 })
  @IsOptional()
  @IsNumber({}, { message: 'SyncAt must be a number (epoch ms)' })
  syncAt?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({ message: 'Deleted must be a boolean' })
  deleted?: boolean;
}

export class SynchronizeDto {
  @ApiPropertyOptional({ type: SyncCowDto, isArray: true })
  @IsOptional()
  @IsArray({ message: 'Cows must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SyncCowDto)
  cows?: SyncCowDto[];

  @ApiPropertyOptional({ type: SyncBodyConditionScoreDto, isArray: true })
  @IsOptional()
  @IsArray({ message: 'Scores must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SyncBodyConditionScoreDto)
  scores?: SyncBodyConditionScoreDto[];
}
