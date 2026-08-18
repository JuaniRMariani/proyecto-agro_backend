import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AccountRole } from '../../user/account-role.enum';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { UserService } from '../../user/user.service';
import { EmailService } from '../emailer/email.service';
import type { IPasswordResetRepository } from './infra/password-reset.repository';
import { PasswordResetChallenge } from './password-reset-challenge.entity';
import { PasswordResetService } from './password-reset.service';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));

const hashPassword = bcrypt.hash as unknown as jest.MockedFunction<
  (plainText: string, rounds: number) => Promise<string>
>;
type UserServiceMock = jest.Mocked<Pick<UserService, 'getUserByEmail'>>;
type EmailServiceMock = jest.Mocked<
  Pick<EmailService, 'sendPasswordResetCode'>
>;

function makeChallenge(
  partial: Partial<PasswordResetChallenge> = {},
): PasswordResetChallenge {
  return Object.assign(new PasswordResetChallenge(), {
    id: '11111111-1111-4111-8111-111111111111',
    userId: '22222222-2222-4222-8222-222222222222',
    emailHash: 'a'.repeat(64),
    codeHash: 'b'.repeat(64),
    expiresAt: new Date(Date.now() + 600_000),
    attempts: 0,
    maxAttempts: 5,
    verifiedAt: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    consumedAt: null,
    createdAt: new Date(),
    ...partial,
  });
}

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let repository: jest.Mocked<IPasswordResetRepository>;
  let userService: UserServiceMock;
  let emailService: EmailServiceMock;

  beforeEach(async () => {
    repository = {
      getOrCreateChallenge: jest.fn(),
      verify: jest.fn(),
      consumeAndChangePassword: jest.fn(),
    };
    userService = { getUserByEmail: jest.fn() };
    emailService = { sendPasswordResetCode: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: 'IPasswordResetRepository', useValue: repository },
        { provide: UserService, useValue: userService },
        { provide: EmailService, useValue: emailService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('reset-secret') },
        },
      ],
    }).compile();
    service = module.get(PasswordResetService);
  });

  it('creates a hashed challenge and emails only a known normalized account', async () => {
    userService.getUserByEmail.mockResolvedValue(
      new UserResponseDto({
        id: '22222222-2222-4222-8222-222222222222',
        email: 'user@example.com',
        fullName: 'User',
        role: AccountRole.PRODUCER,
      }),
    );
    repository.getOrCreateChallenge.mockImplementation((input) =>
      Promise.resolve({ kind: 'created', challenge: makeChallenge(input) }),
    );

    const result = await service.requestReset({
      email: ' USER@EXAMPLE.COM ',
    });

    expect(result.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(userService.getUserByEmail.mock.calls).toContainEqual([
      'user@example.com',
    ]);
    const createInput = repository.getOrCreateChallenge.mock.calls[0][0];
    expect(createInput.codeHash).toMatch(/^[0-9a-f]{64}$/);
    expect(createInput.emailHash).toMatch(/^[0-9a-f]{64}$/);
    expect(createInput.codeHash).not.toContain('123456');
    expect(emailService.sendPasswordResetCode.mock.calls[0][1]).toMatch(
      /^\d{6}$/,
    );
  });

  it('creates the same opaque challenge shape for an unknown email', async () => {
    userService.getUserByEmail.mockResolvedValue(null);
    repository.getOrCreateChallenge.mockImplementation((input) =>
      Promise.resolve({ kind: 'created', challenge: makeChallenge(input) }),
    );

    const result = await service.requestReset({ email: 'missing@example.com' });

    expect(result.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(repository.getOrCreateChallenge.mock.calls[0][0].userId).toBeNull();
    expect(emailService.sendPasswordResetCode.mock.calls).toHaveLength(0);
  });

  it('applies the same cooldown result for known and unknown emails', async () => {
    const existing = makeChallenge();
    userService.getUserByEmail.mockResolvedValue(null);
    repository.getOrCreateChallenge.mockResolvedValue({
      kind: 'cooldown',
      challenge: existing,
    });

    await expect(
      service.requestReset({ email: 'any@example.com' }),
    ).resolves.toEqual({ requestId: existing.id });
    expect(repository.getOrCreateChallenge.mock.calls).toHaveLength(1);
    expect(emailService.sendPasswordResetCode.mock.calls).toHaveLength(0);
  });

  it('preserves the cooldown tombstone when email delivery fails', async () => {
    userService.getUserByEmail.mockResolvedValue(
      new UserResponseDto({
        id: '22222222-2222-4222-8222-222222222222',
        email: 'user@example.com',
        fullName: 'User',
        role: AccountRole.PRODUCER,
      }),
    );
    repository.getOrCreateChallenge.mockImplementation((input) =>
      Promise.resolve({ kind: 'created', challenge: makeChallenge(input) }),
    );
    emailService.sendPasswordResetCode.mockRejectedValue(new Error('SMTP'));

    const result = await service.requestReset({ email: 'user@example.com' });

    expect(result.requestId).toBeDefined();
    expect(repository.getOrCreateChallenge.mock.calls).toHaveLength(1);
  });

  it('returns an opaque reset token only after atomic verification', async () => {
    repository.verify.mockResolvedValue({ kind: 'verified' });

    const result = await service.verifyReset({
      requestId: '11111111-1111-4111-8111-111111111111',
      code: '123456',
    });

    expect(result.resetToken.length).toBeGreaterThan(32);
    expect(repository.verify.mock.calls[0][0].codeHash).not.toBe('123456');
    expect(repository.verify.mock.calls[0][0].resetTokenHash).not.toBe(
      result.resetToken,
    );
  });

  it('rejects invalid verification without returning a token', async () => {
    repository.verify.mockResolvedValue({ kind: 'invalid' });
    await expect(
      service.verifyReset({
        requestId: '11111111-1111-4111-8111-111111111111',
        code: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('defers bcrypt until the repository validates and locks the reset token', async () => {
    hashPassword.mockResolvedValue('password-hash');
    repository.consumeAndChangePassword.mockImplementation(async (input) => {
      expect(hashPassword.mock.calls).toHaveLength(0);
      expect(await input.hashPassword()).toBe('password-hash');
      return true;
    });

    await service.confirmReset({
      requestId: '11111111-1111-4111-8111-111111111111',
      resetToken: 'opaque-token',
      password: 'newpass',
      passwordConfirmation: 'newpass',
    });

    expect(hashPassword.mock.calls).toContainEqual(['newpass', 12]);
  });

  it('rejects reset passwords longer than 72 UTF-8 bytes before repository work', async () => {
    const oversizedPassword = String.fromCodePoint(0x1f404).repeat(19);

    await expect(
      service.confirmReset({
        requestId: '11111111-1111-4111-8111-111111111111',
        resetToken: 'opaque-token',
        password: oversizedPassword,
        passwordConfirmation: oversizedPassword,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.consumeAndChangePassword.mock.calls).toHaveLength(0);
  });
});
