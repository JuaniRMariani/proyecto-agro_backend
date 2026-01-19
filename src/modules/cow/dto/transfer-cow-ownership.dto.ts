import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class TransferCowOwnershipDto {
  @IsUUID('4', { message: 'New user ID must be a valid UUID' })
  @IsNotEmpty({ message: 'New user ID is required' })
  newUserId: string;

  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  reason?: string;
}
