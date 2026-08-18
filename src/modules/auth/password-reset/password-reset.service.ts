import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHmac, randomBytes, randomInt, randomUUID } from 'crypto';
import { UserService } from '../../user/user.service';
import { EmailService } from '../emailer/email.service';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import {
  PasswordResetRequestResponseDto,
  PasswordResetVerifyResponseDto,
} from './dto/password-reset-response.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyPasswordResetDto } from './dto/verify-password-reset.dto';
import type {
  CreatePasswordResetChallenge,
  IPasswordResetRepository,
} from './infra/password-reset.repository';
import { assertBcryptPasswordLength } from '../../../common/validation/password-byte-length.validator';

const CHALLENGE_LIFETIME_MS = 10 * 60 * 1000;
const RESET_TOKEN_LIFETIME_MS = 10 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MINIMUM_REQUEST_DURATION_MS = 750;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly secret: string;

  constructor(
    @Inject('IPasswordResetRepository')
    private readonly repository: IPasswordResetRepository,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    configService: ConfigService,
  ) {
    const passwordResetSecret = configService.get<string>(
      'PASSWORD_RESET_SECRET',
    );
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const secret = passwordResetSecret ?? jwtSecret;
    if (!secret) {
      throw new Error('PASSWORD_RESET_SECRET or JWT_SECRET is required');
    }
    if (!passwordResetSecret) {
      this.logger.warn(
        'PASSWORD_RESET_SECRET is not configured; using JWT_SECRET for compatibility',
      );
    }
    this.secret = secret;
  }

  async requestReset(
    dto: RequestPasswordResetDto,
  ): Promise<PasswordResetRequestResponseDto> {
    const now = new Date();
    const minimumDuration = this.delay(MINIMUM_REQUEST_DURATION_MS);
    const email = dto.email.trim().toLowerCase();
    const emailHash = this.hashEmail(email);
    const user = await this.userService.getUserByEmail(email);

    const id = randomUUID();
    const code = randomInt(100000, 1000000).toString();
    const challengeInput: CreatePasswordResetChallenge = {
      id,
      userId: user?.id ?? null,
      emailHash,
      codeHash: this.hashSecret('code', id, code),
      expiresAt: new Date(now.getTime() + CHALLENGE_LIFETIME_MS),
      maxAttempts: MAX_ATTEMPTS,
    };
    const creation = await this.repository.getOrCreateChallenge(
      challengeInput,
      new Date(now.getTime() - REQUEST_COOLDOWN_MS),
    );
    const delivery =
      creation.kind === 'created' && user
        ? this.deliverCode(email, code, creation.challenge.id)
        : Promise.resolve();
    await Promise.all([delivery, minimumDuration]);

    return new PasswordResetRequestResponseDto(creation.challenge.id);
  }

  async verifyReset(
    dto: VerifyPasswordResetDto,
  ): Promise<PasswordResetVerifyResponseDto> {
    const now = new Date();
    const resetToken = randomBytes(32).toString('base64url');
    const result = await this.repository.verify({
      challengeId: dto.requestId,
      codeHash: this.hashSecret('code', dto.requestId, dto.code),
      resetTokenHash: this.hashSecret('reset-token', dto.requestId, resetToken),
      resetTokenExpiresAt: new Date(now.getTime() + RESET_TOKEN_LIFETIME_MS),
      now,
    });
    if (result.kind === 'invalid') {
      throw new BadRequestException('Solicitud o cÃ³digo invÃ¡lido');
    }
    return new PasswordResetVerifyResponseDto(resetToken);
  }

  async confirmReset(dto: ConfirmPasswordResetDto): Promise<void> {
    assertBcryptPasswordLength(dto.password);
    if (dto.password !== dto.passwordConfirmation) {
      throw new BadRequestException('Las contraseÃ±as no coinciden');
    }
    const consumed = await this.repository.consumeAndChangePassword({
      challengeId: dto.requestId,
      resetTokenHash: this.hashSecret(
        'reset-token',
        dto.requestId,
        dto.resetToken,
      ),
      hashPassword: () => bcrypt.hash(dto.password, 12),
      now: new Date(),
    });
    if (!consumed) {
      throw new BadRequestException('Solicitud de cambio invÃ¡lida o expirada');
    }
  }

  private hashSecret(
    purpose: 'code' | 'reset-token',
    challengeId: string,
    value: string,
  ): string {
    return createHmac('sha256', this.secret)
      .update(`${purpose}:${challengeId}:${value}`)
      .digest('hex');
  }

  private hashEmail(email: string): string {
    return createHmac('sha256', this.secret)
      .update(`email:${email}`)
      .digest('hex');
  }

  private async deliverCode(
    email: string,
    code: string,
    challengeId: string,
  ): Promise<void> {
    try {
      await this.emailService.sendPasswordResetCode(email, code);
    } catch {
      this.logger.warn(
        `Password reset email failed for challenge ${challengeId}`,
      );
    }
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
