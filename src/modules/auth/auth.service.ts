import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { authMapperToResponseDto } from './auth.mapper';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(userCredentials: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      userCredentials.email,
      userCredentials.password,
    );
    if (!user) {
      throw new NotFoundException('Credenciales inválidas');
    }
    const accessToken = await this.getAccessToken(user);
    const mappedAuthResponse = authMapperToResponseDto(user, accessToken);
    if (!mappedAuthResponse) {
      throw new ConflictException('Error al mapear la respuesta de autenticación');
    }
    return mappedAuthResponse;
  }

  async register(userData: CreateUserDto): Promise<AuthResponseDto> {
    if (userData.password !== userData.passwordConfirmation) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const newUser = await this.userService.createUser(userData);
    const accessToken = await this.getAccessToken(newUser);
    const mappedAuthResponse = new AuthResponseDto({
      accessToken,
      user: newUser,
    });
    return mappedAuthResponse;
  }

  async logout(tokenToInvalidate: string) {
    if (!tokenToInvalidate) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    await this.jwtService.decode(tokenToInvalidate);
  }

  private async validateUser(
    username: string,
    pass: string,
  ): Promise<User | null> {
    const user = await this.userService.getUserByEmailWithPassword(username);
    if (user && (await this.comparePasswords(pass, user.password))) {
      return user;
    }
    return null;
  }

  private async getAccessToken(user: UserResponseDto): Promise<string> {
    const payload = { username: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
