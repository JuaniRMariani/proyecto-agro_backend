import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AccountRole } from '../user/account-role.enum';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { EmailService } from './emailer/email.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const comparePassword = bcrypt.compare as unknown as jest.MockedFunction<
  (plainText: string, hash: string) => Promise<boolean>
>;

type UserServiceMock = jest.Mocked<
  Pick<
    UserService,
    | 'createUser'
    | 'getUserByEmail'
    | 'getUserByEmailWithPassword'
    | 'saveVerificationCode'
    | 'clearVerificationCode'
    | 'findByVerificationCode'
    | 'changePassword'
  >
>;
type JwtServiceMock = jest.Mocked<Pick<JwtService, 'sign' | 'decode'>>;
type EmailServiceMock = jest.Mocked<Pick<EmailService, 'sendVerificationCode'>>;

function makeUser(partial: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: '11111111-1111-4111-8111-111111111111',
    email: 't@example.com',
    password: 'hashed',
    fullName: 'Test',
    role: AccountRole.PRODUCER,
    cows: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  });
}

function makeUserResponse(
  partial: Partial<UserResponseDto> = {},
): UserResponseDto {
  return new UserResponseDto({
    id: '11111111-1111-4111-8111-111111111111',
    email: 't@example.com',
    fullName: 'Test',
    role: AccountRole.PRODUCER,
    ...partial,
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserServiceMock;
  let jwtService: JwtServiceMock;
  let emailService: EmailServiceMock;

  beforeEach(async () => {
    userService = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByEmailWithPassword: jest.fn(),
      saveVerificationCode: jest.fn(),
      clearVerificationCode: jest.fn(),
      findByVerificationCode: jest.fn(),
      changePassword: jest.fn(),
    };
    jwtService = { sign: jest.fn(), decode: jest.fn() };
    emailService = { sendVerificationCode: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('logs in and returns token', async () => {
    userService.getUserByEmailWithPassword.mockResolvedValue(makeUser());
    comparePassword.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    const result = await service.login({
      email: 't@example.com',
      password: 'plain',
    });

    expect(result.accessToken).toBe('token');
    expect(result.user.role).toBe(AccountRole.PRODUCER);
    expect(jwtService.sign.mock.calls).toContainEqual([
      {
        email: 't@example.com',
        role: AccountRole.PRODUCER,
        sub: '11111111-1111-4111-8111-111111111111',
      },
    ]);
  });

  it('throws when login credentials invalid', async () => {
    userService.getUserByEmailWithPassword.mockResolvedValue(null);
    await expect(
      service.login({ email: 't@example.com', password: 'bad' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('registers user when passwords match', async () => {
    userService.createUser.mockResolvedValue(
      makeUserResponse({ role: AccountRole.VETERINARIAN }),
    );
    jwtService.sign.mockReturnValue('token');

    const result = await service.register({
      fullName: 'Test',
      email: 't@example.com',
      password: 'pass',
      passwordConfirmation: 'pass',
      role: AccountRole.VETERINARIAN,
    });

    expect(result.accessToken).toBe('token');
    expect(result.user.role).toBe(AccountRole.VETERINARIAN);
    expect(userService.createUser.mock.calls).toHaveLength(1);
  });

  it('throws when register passwords do not match', async () => {
    await expect(
      service.register({
        fullName: 'Test',
        email: 't@example.com',
        password: 'pass',
        passwordConfirmation: 'other',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sends verification code', async () => {
    userService.getUserByEmail.mockResolvedValue(makeUserResponse());

    await service.sendCode('t@example.com');

    expect(emailService.sendVerificationCode.mock.calls).toHaveLength(1);
    expect(userService.saveVerificationCode.mock.calls).toHaveLength(1);
  });

  it('throws when sending code to unknown user', async () => {
    userService.getUserByEmail.mockResolvedValue(null);
    await expect(
      service.sendCode('missing@example.com'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('verifies code', async () => {
    userService.findByVerificationCode.mockResolvedValue(makeUser());
    await expect(service.verifyCode('123456')).resolves.toEqual({
      valid: true,
    });
  });

  it('throws when verify code is invalid', async () => {
    userService.findByVerificationCode.mockResolvedValue(null);
    await expect(service.verifyCode('bad')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('resets password when code valid', async () => {
    userService.findByVerificationCode.mockResolvedValue(makeUser());

    await service.resetPassword('123456', 'newpass', 'newpass');

    expect(userService.changePassword.mock.calls).toContainEqual([
      '11111111-1111-4111-8111-111111111111',
      'newpass',
    ]);
    expect(userService.clearVerificationCode.mock.calls).toContainEqual([
      '11111111-1111-4111-8111-111111111111',
    ]);
  });

  it('throws when reset password confirmation mismatches', async () => {
    await expect(
      service.resetPassword('code', 'newpass', 'other'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when logout without token', async () => {
    await expect(service.logout(undefined)).rejects.toThrow(
      'Token no proporcionado',
    );
  });
});
