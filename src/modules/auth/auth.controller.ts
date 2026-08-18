import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfirmPasswordResetDto } from './password-reset/dto/confirm-password-reset.dto';
import {
  PasswordResetRequestResponseDto,
  PasswordResetVerifyResponseDto,
} from './password-reset/dto/password-reset-response.dto';
import { RequestPasswordResetDto } from './password-reset/dto/request-password-reset.dto';
import { VerifyPasswordResetDto } from './password-reset/dto/verify-password-reset.dto';
import { PasswordResetService } from './password-reset/password-reset.service';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @ResponseMessage('Usuario logueado exitosamente')
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() loginData: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(loginData);
  }

  @ResponseMessage('Usuario registrado exitosamente')
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60 * 60_000 } })
  @ApiCreatedResponse({ type: AuthResponseDto })
  register(@Body() userData: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.register(userData);
  }

  @ResponseMessage('Usuario deslogeado exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiOkResponse({
    schema: { example: { message: 'Usuario deslogeado exitosamente' } },
  })
  logout(@Request() request: AuthenticatedRequest): Promise<void> {
    const token = request.headers.authorization?.split(' ')[1];
    return this.authService.logout(token);
  }

  @ResponseMessage(
    'Si el correo esta registrado, recibiras un codigo de recuperacion',
  )
  @Post('password-reset/request')
  @Throttle({ default: { limit: 3, ttl: 10 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PasswordResetRequestResponseDto })
  requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
  ): Promise<PasswordResetRequestResponseDto> {
    return this.passwordResetService.requestReset(body);
  }

  @ResponseMessage('Codigo verificado exitosamente')
  @Post('password-reset/verify')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PasswordResetVerifyResponseDto })
  verifyPasswordReset(
    @Body() body: VerifyPasswordResetDto,
  ): Promise<PasswordResetVerifyResponseDto> {
    return this.passwordResetService.verifyReset(body);
  }

  @ResponseMessage('Contrasena restablecida exitosamente')
  @Post('password-reset/confirm')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: { example: { message: 'Contrasena restablecida exitosamente' } },
  })
  confirmPasswordReset(@Body() body: ConfirmPasswordResetDto): Promise<void> {
    return this.passwordResetService.confirmReset(body);
  }
}
