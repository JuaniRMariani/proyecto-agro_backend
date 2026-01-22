import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ example: 'jwt.token.here' })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
