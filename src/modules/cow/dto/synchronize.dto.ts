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

export class SyncCowDto {
  @IsString({ message: 'Tag number must be a string' })
  @IsNotEmpty({ message: 'Tag number is required' })
  tagNumber: string;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'UpdatedAt must be a number (epoch ms)' })
  updatedAt?: number;

  @IsOptional()
  @IsNumber({}, { message: 'CreatedAt must be a number (epoch ms)' })
  createdAt?: number;

  @IsOptional()
  @IsNumber({}, { message: 'SyncAt must be a number (epoch ms)' })
  syncAt?: number;

  @IsOptional()
  @IsBoolean({ message: 'Deleted must be a boolean' })
  deleted?: boolean;
}

export class SyncBodyConditionScoreDto {
  @IsOptional()
  @IsUUID('4', { message: 'Id must be a valid UUID' })
  id?: string;

  @IsString({ message: 'Cow tag number must be a string' })
  @IsNotEmpty({ message: 'Cow tag number is required' })
  cowTagNumber: string;

  @IsOptional()
  @IsNumber({}, { message: 'Score must be a number' })
  score?: number;

  @IsOptional()
  @IsNumber({}, { message: 'RecordedAt must be a number (epoch ms)' })
  recordedAt?: number;

  @IsOptional()
  @IsString({ message: 'Observation must be a string' })
  observation?: string;

  @IsOptional()
  @IsNumber({}, { message: 'UpdatedAt must be a number (epoch ms)' })
  updatedAt?: number;

  @IsOptional()
  @IsNumber({}, { message: 'CreatedAt must be a number (epoch ms)' })
  createdAt?: number;

  @IsOptional()
  @IsNumber({}, { message: 'SyncAt must be a number (epoch ms)' })
  syncAt?: number;

  @IsOptional()
  @IsBoolean({ message: 'Deleted must be a boolean' })
  deleted?: boolean;
}

export class SynchronizeDto {
  @IsOptional()
  @IsArray({ message: 'Cows must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SyncCowDto)
  cows?: SyncCowDto[];

  @IsOptional()
  @IsArray({ message: 'Scores must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SyncBodyConditionScoreDto)
  scores?: SyncBodyConditionScoreDto[];
}
