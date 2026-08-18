import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { ProfessionalAccessStatus } from '../professional-access-status.enum';

export class ProfessionalAccessResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ProfessionalAccessStatus })
  status: ProfessionalAccessStatus;

  @ApiProperty({ type: UserResponseDto })
  producer: UserResponseDto;

  @ApiProperty({ type: UserResponseDto })
  professional: UserResponseDto;

  @ApiProperty({ example: '2026-08-18T18:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-18T18:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<ProfessionalAccessResponseDto>) {
    Object.assign(this, partial);
  }
}
