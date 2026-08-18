import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AccountRole } from '../user/account-role.enum';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

const comparePassword = bcrypt.compare as unknown as jest.MockedFunction<
  (plainText: string, hash: string) => Promise<boolean>
>;
type UserServiceMock = jest.Mocked<
  Pick<
    UserService,
    'createUser' | 'getUserByEmailWithPassword' | 'getUserTokenVersion'
  >
>;
type JwtServiceMock = jest.Mocked<Pick<JwtService, 'sign' | 'decode'>>;

function makeUser(): User {
  return Object.assign(new User(), {
    id: '11111111-1111-4111-8111-111111111111',
    email: 't@example.com',
    password: 'hashed',
    fullName: 'Test',
    role: AccountRole.PRODUCER,
    tokenVersion: 0,
    cows: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUserResponse(): UserResponseDto {
  return new UserResponseDto({
    id: '11111111-1111-4111-8111-111111111111',
    email: 't@example.com',
    fullName: 'Test',
    role: AccountRole.PRODUCER,
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserServiceMock;
  let jwtService: JwtServiceMock;

  beforeEach(async () => {
    userService = {
      createUser: jest.fn(),
      getUserByEmailWithPassword: jest.fn(),
      getUserTokenVersion: jest.fn(),
    };
    jwtService = { sign: jest.fn(), decode: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('normalizes email on login and returns a role-bearing token', async () => {
    userService.getUserByEmailWithPassword.mockResolvedValue(makeUser());
    comparePassword.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    const result = await service.login({
      email: ' T@EXAMPLE.COM ',
      password: 'plain',
    });

    expect(userService.getUserByEmailWithPassword.mock.calls).toContainEqual([
      't@example.com',
    ]);
    expect(result.accessToken).toBe('token');
    expect(result.user.role).toBe(AccountRole.PRODUCER);
  });

  it('does not reveal whether email or password was invalid', async () => {
    userService.getUserByEmailWithPassword.mockResolvedValue(null);
    await expect(
      service.login({ email: 'missing@example.com', password: 'bad' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('registers a user when passwords match', async () => {
    userService.createUser.mockResolvedValue(makeUserResponse());
    userService.getUserTokenVersion.mockResolvedValue(0);
    jwtService.sign.mockReturnValue('token');

    const result = await service.register({
      fullName: 'Test',
      email: 't@example.com',
      password: 'pass12',
      passwordConfirmation: 'pass12',
    });

    expect(result.accessToken).toBe('token');
    expect(userService.createUser.mock.calls).toHaveLength(1);
    expect(jwtService.sign.mock.calls).toContainEqual([
      {
        email: 't@example.com',
        role: AccountRole.PRODUCER,
        sub: '11111111-1111-4111-8111-111111111111',
        version: 0,
      },
    ]);
  });

  it('rejects mismatched registration passwords', async () => {
    await expect(
      service.register({
        fullName: 'Test',
        email: 't@example.com',
        password: 'pass12',
        passwordConfirmation: 'other1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects registration passwords longer than 72 UTF-8 bytes', async () => {
    const oversizedPassword = String.fromCodePoint(0x1f404).repeat(19);

    await expect(
      service.register({
        fullName: 'Test',
        email: 't@example.com',
        password: oversizedPassword,
        passwordConfirmation: oversizedPassword,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userService.createUser.mock.calls).toHaveLength(0);
  });

  it('rejects logout without token', async () => {
    await expect(service.logout(undefined)).rejects.toThrow(
      'Token no proporcionado',
    );
  });
});
