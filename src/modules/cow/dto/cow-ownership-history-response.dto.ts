import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CowOwnershipHistoryResponseDto {
  @ApiProperty({ example: 'history-id' })
  id: string;

  @ApiProperty({ example: 'cow-id' })
  cowId: string;

  @ApiPropertyOptional({ example: 'previous-user-id' })
  previousUserId: string | null;

  @ApiProperty({ example: 'new-user-id' })
  newUserId: string;

  @ApiPropertyOptional({ example: 'Ownership transfer' })
  reason: string | null;

  @ApiProperty({ example: '2026-01-22T00:00:00.000Z' })
  transferredAt: Date;

  constructor(partial: Partial<CowOwnershipHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
