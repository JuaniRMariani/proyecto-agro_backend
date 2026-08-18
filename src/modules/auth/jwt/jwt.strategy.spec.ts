import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountRole } from '../../user/account-role.enum';
import { UserService } from '../../user/user.service';
import { JwtStrategy } from './jwt.strategy';

type UserServiceMock = jest.Mocked<Pick<UserService, 'getUserTokenVersion'>>;

describe('JwtStrategy token version', () => {
  let strategy: JwtStrategy;
  let userService: UserServiceMock;

  beforeEach(async () => {
    userService = { getUserTokenVersion: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: new ConfigService({ JWT_SECRET: 'test-secret' }),
        },
        { provide: UserService, useValue: userService },
      ],
    }).compile();
    strategy = module.get(JwtStrategy);
  });

  it('accepts a token whose version matches current auth state', async () => {
    userService.getUserTokenVersion.mockResolvedValue(2);

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'vet@example.com',
        role: AccountRole.VETERINARIAN,
        version: 2,
      }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'vet@example.com',
      role: AccountRole.VETERINARIAN,
    });
  });

  it('keeps legacy version-zero tokens compatible before a reset', async () => {
    userService.getUserTokenVersion.mockResolvedValue(0);

    await expect(
      strategy.validate({ sub: 'user-1', username: 'old@example.com' }),
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'old@example.com',
      role: AccountRole.PRODUCER,
    });
  });

  it('rejects old tokens after password reset increments auth state', async () => {
    userService.getUserTokenVersion.mockResolvedValue(1);

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'user@example.com',
        version: 0,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
