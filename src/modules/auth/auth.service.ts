import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { authMapperToResponseDto } from './auth.mapper';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { assertBcryptPasswordLength } from '../../common/validation/password-byte-length.validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(userCredentials: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      userCredentials.email.trim().toLowerCase(),
      userCredentials.password,
    );
    if (!user) {
      throw new NotFoundException('Credenciales invalidas');
    }
    const accessToken = this.getAccessToken(user, user.tokenVersion);
    const mappedAuthResponse = authMapperToResponseDto(user, accessToken);
    if (!mappedAuthResponse) {
      throw new ConflictException(
        'Error al mapear la respuesta de autenticacion',
      );
    }
    return mappedAuthResponse;
  }

  async register(userData: CreateUserDto): Promise<AuthResponseDto> {
    assertBcryptPasswordLength(userData.password);
    if (userData.password !== userData.passwordConfirmation) {
      throw new BadRequestException('Las contrasenas no coinciden');
    }
    const newUser = await this.userService.createUser(userData);
    const tokenVersion =
      (await this.userService.getUserTokenVersion(newUser.id)) ?? 0;
    const accessToken = this.getAccessToken(newUser, tokenVersion);
    return new AuthResponseDto({ accessToken, user: newUser });
  }

  async logout(tokenToInvalidate: string | undefined): Promise<void> {
    if (!tokenToInvalidate) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    await this.jwtService.decode(tokenToInvalidate);
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.getUserByEmailWithPassword(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  private getAccessToken(user: UserResponseDto, tokenVersion: number): string {
    return this.jwtService.sign({
      email: user.email,
      role: user.role,
      sub: user.id,
      version: tokenVersion,
    });
  }
}
