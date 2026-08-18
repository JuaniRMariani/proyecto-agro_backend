import { ApiProperty } from '@nestjs/swagger';
import { AccountRole } from '../../user/account-role.enum';

export class ProfessionalClientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Productor Ejemplo' })
  fullName: string;

  @ApiProperty({ example: 'productor@example.com' })
  email: string;

  @ApiProperty({ enum: AccountRole, example: AccountRole.PRODUCER })
  role: AccountRole;

  @ApiProperty({ format: 'uuid' })
  accessId: string;

  constructor(partial: Partial<ProfessionalClientResponseDto>) {
    Object.assign(this, partial);
  }
}
