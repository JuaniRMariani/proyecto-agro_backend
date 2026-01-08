import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
