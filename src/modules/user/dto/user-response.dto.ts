import { ApiProperty } from '@nestjs/swagger';
import { AccountRole } from '../account-role.enum';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Juan Perez' })
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: AccountRole, example: AccountRole.PRODUCER })
  role: AccountRole;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
