import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { EmailService } from './emailer/email.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    userService = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByEmailWithPassword: jest.fn(),
      saveVerificationCode: jest.fn(),
      clearVerificationCode: jest.fn(),
      findByVerificationCode: jest.fn(),
      changePassword: jest.fn(),
    } as any;
    jwtService = { sign: jest.fn(), decode: jest.fn() } as any;
    emailService = { sendVerificationCode: jest.fn() } as any;

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
    userService.getUserByEmailWithPassword.mockResolvedValue({
      id: 'user-1',
      email: 't@example.com',
      password: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    const result = await service.login({
      email: 't@example.com',
      password: 'plain',
    });

    expect(result.accessToken).toBe('token');
  });

  it('throws when login credentials invalid', async () => {
    userService.getUserByEmailWithPassword.mockResolvedValue(null as any);
    await expect(
      service.login({ email: 't@example.com', password: 'bad' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('registers user when passwords match', async () => {
    userService.createUser.mockResolvedValue({
      id: 'user-1',
      email: 't@example.com',
      fullName: 'Test',
    } as any);
    jwtService.sign.mockReturnValue('token');

    const result = await service.register({
      fullName: 'Test',
      email: 't@example.com',
      password: 'pass',
      passwordConfirmation: 'pass',
    });

    expect(result.accessToken).toBe('token');
    expect(userService.createUser).toHaveBeenCalled();
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
    userService.getUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 't@example.com',
    } as any);

    await service.sendCode('t@example.com');

    expect(emailService.sendVerificationCode).toHaveBeenCalled();
    expect(userService.saveVerificationCode).toHaveBeenCalled();
  });

  it('throws when sending code to unknown user', async () => {
    userService.getUserByEmail.mockResolvedValue(null as any);
    await expect(
      service.sendCode('missing@example.com'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('verifies code', async () => {
    userService.findByVerificationCode.mockResolvedValue({
      id: 'user-1',
    } as any);
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
    userService.findByVerificationCode.mockResolvedValue({
      id: 'user-1',
    } as any);

    await service.resetPassword('123456', 'newpass', 'newpass');

    expect(userService.changePassword).toHaveBeenCalledWith(
      'user-1',
      'newpass',
    );
    expect(userService.clearVerificationCode).toHaveBeenCalledWith('user-1');
  });

  it('throws when reset password confirmation mismatches', async () => {
    await expect(
      service.resetPassword('code', 'newpass', 'other'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when logout without token', async () => {
    await expect(service.logout(undefined as any)).rejects.toThrow(
      'Token no proporcionado',
    );
  });
});
