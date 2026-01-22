import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @ResponseMessage('Usuario logueado exitosamente')
  @Post('login')
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() loginData: LoginUserDto): Promise<AuthResponseDto> {
    const userLogged = await this.authService.login(loginData);
    return userLogged;
  }

  @ResponseMessage('Usuario registrado exitosamente')
  @Post('register')
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(@Body() userData: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.register(userData);
  }

  @ResponseMessage('Usuario deslogeado exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiOkResponse({ schema: { example: { message: 'Usuario deslogeado exitosamente' } } })
  async logout(@Request() req): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(token);
  }

  @ResponseMessage('Token de acceso renovado exitosamente')
  @Post('send-code')
  @ApiOkResponse({ schema: { example: { message: 'Token de acceso renovado exitosamente' } } })
  async sendCode(@Body() body: SendCodeDto): Promise<void> {
    return this.authService.sendCode(body.email);
  }

  @ResponseMessage('Código verificado exitosamente')
  @Post('verify-code')
  @ApiOkResponse({ schema: { example: { valid: true } } })
  async verifyCode(@Body() body: VerifyCodeDto): Promise<{ valid: boolean }> {
    return this.authService.verifyCode(body.code);
  }

  @ResponseMessage('Contraseña restablecida exitosamente')
  @Post('reset-password')
  @ApiOkResponse({ schema: { example: { message: 'ContraseÃ±a restablecida exitosamente' } } })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(body.code, body.password, body.passwordConfirmation);
  }
}
