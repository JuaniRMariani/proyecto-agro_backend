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
import { EmailService } from './emailer/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

  async sendCode(email: string): Promise<void> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const verificationCode = await this.generateVerificationCode(user.id);
    this.emailService.sendVerificationCode(email, verificationCode);
  }

  async verifyCode(code: string): Promise<{ valid: boolean }> {
    const user = await this.userService.findByVerificationCode(code);
    if (!user) {
      throw new BadRequestException('Código inválido o expirado');
    }
    return { valid: true };
  }

  async resetPassword(code: string, newPassword: string, passwordConfirmation: string): Promise<void> {
    if (newPassword !== passwordConfirmation) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.userService.findByVerificationCode(code);
    if (!user) {
      throw new BadRequestException('Código inválido o expirado');
    }

    await this.userService.changePassword(user.id, newPassword);
    await this.userService.clearVerificationCode(user.id);
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

  private async generateVerificationCode(userId: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.userService.saveVerificationCode(userId, code, new Date(Date.now() + 10 * 60 * 1000)); // Código válido por 10 minutos
    return code;
  }
}
