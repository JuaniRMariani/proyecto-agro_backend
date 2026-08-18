import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-request.interface';
import { AccountRole } from '../../user/account-role.enum';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

interface JwtPayload {
  sub: string;
  email?: string;
  username?: string;
  role?: AccountRole;
  version?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const currentVersion = await this.userService.getUserTokenVersion(
      payload.sub,
    );
    if (currentVersion === null || currentVersion !== (payload.version ?? 0)) {
      throw new UnauthorizedException('Token revocado');
    }
    return {
      userId: payload.sub,
      email: payload.email ?? payload.username ?? '',
      role: payload.role ?? AccountRole.PRODUCER,
    };
  }
}
