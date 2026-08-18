import { UserResponseDto } from './dto/user-response.dto';
import { User } from './user.entity';

export function userMapperToResponseDto(user: User): UserResponseDto | null {
  if (!user) return null;

  return new UserResponseDto({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });
}
