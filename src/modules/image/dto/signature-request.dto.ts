import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SignatureRequestDto {
  @ApiPropertyOptional({
    example: '73583dc2-e179-4931-b495-1f85c1382152',
    description: 'The server ID of the body condition score (if it exists)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Score ID must be a valid UUID' })
  scoreId?: string;

  @ApiPropertyOptional({
    example: 'client-uuid-123',
    description: 'The client-generated UUID for the score (preferred for offline-first)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Client ID must be a valid UUID' })
  clientId?: string;
}
