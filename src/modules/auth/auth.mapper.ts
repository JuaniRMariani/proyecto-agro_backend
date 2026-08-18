import { User } from '../user/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';

export function authMapperToResponseDto(
  userData: User,
  token: string,
): AuthResponseDto | null {
  if (!userData || !token) return null;

  return new AuthResponseDto({
    accessToken: token,
    user: {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
    },
  });
}
