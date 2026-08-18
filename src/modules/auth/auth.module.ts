import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './emailer/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetChallenge } from './password-reset/password-reset-challenge.entity';
import { PasswordResetService } from './password-reset/password-reset.service';
import { PasswordResetTypeOrmRepository } from './password-reset/infra/password-reset.typeorm.repository';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([PasswordResetChallenge]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
    PasswordResetService,
    {
      provide: 'IPasswordResetRepository',
      useClass: PasswordResetTypeOrmRepository,
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
