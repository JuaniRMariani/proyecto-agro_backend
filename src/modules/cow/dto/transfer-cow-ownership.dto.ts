import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferCowOwnershipDto {
  @ApiProperty({ example: '3b6efa53-e23f-4bda-adf5-29ae714acac4' })
  @IsUUID('4', { message: 'New user ID must be a valid UUID' })
  @IsNotEmpty({ message: 'New user ID is required' })
  newUserId: string;

  @ApiPropertyOptional({ example: 'Sold or transferred ownership' })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  reason?: string;
}
