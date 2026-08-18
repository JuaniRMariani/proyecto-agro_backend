import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { IUserRepository } from './infra/user.repository';
import { AccountRole } from './account-role.enum';
import { User } from './user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const hashPassword = bcrypt.hash as unknown as jest.MockedFunction<
  (plainText: string, rounds: number) => Promise<string>
>;

function makeUser(partial: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 'user-1',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'hashed',
    role: AccountRole.PRODUCER,
    cows: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  });
}

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      changePassword: jest.fn(),
      saveVerificationCode: jest.fn(),
      clearVerificationCode: jest.fn(),
      findByVerificationCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'IUserRepository', useValue: userRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user with hashed password', async () => {
    hashPassword.mockResolvedValue('hashed');
    userRepository.create.mockResolvedValue(makeUser());

    const result = await service.createUser({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'plain',
      passwordConfirmation: 'plain',
    });

    expect(hashPassword.mock.calls).toContainEqual(['plain', 10]);
    expect(userRepository.create.mock.calls).toContainEqual([
      {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        role: AccountRole.PRODUCER,
      },
    ]);
    expect(result).toEqual({
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: AccountRole.PRODUCER,
    });
  });

  it('throws ConflictException on duplicate email', async () => {
    userRepository.create.mockRejectedValue({ code: '23505' });
    await expect(
      service.createUser({
        fullName: 'Dup User',
        email: 'dup@example.com',
        password: 'plain',
        passwordConfirmation: 'plain',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws InternalServerErrorException on unexpected error', async () => {
    userRepository.create.mockRejectedValue(new Error('boom'));
    await expect(
      service.createUser({
        fullName: 'User',
        email: 'user@example.com',
        password: 'plain',
        passwordConfirmation: 'plain',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('hashes password on update', async () => {
    hashPassword.mockResolvedValue('hashed');
    userRepository.update.mockResolvedValue(
      makeUser({ fullName: 'Updated User' }),
    );

    await service.updateUser('user-1', { password: 'newpass' });

    expect(hashPassword.mock.calls).toContainEqual(['newpass', 10]);
    expect(userRepository.update.mock.calls).toContainEqual([
      'user-1',
      { password: 'hashed' },
    ]);
  });

  it('returns null when getUserByEmail does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(
      service.getUserByEmail('missing@example.com'),
    ).resolves.toBeNull();
  });

  it('changes password with hashing', async () => {
    hashPassword.mockResolvedValue('hashed');
    await service.changePassword('user-1', 'newpass');
    expect(hashPassword.mock.calls).toContainEqual(['newpass', 10]);
    expect(userRepository.changePassword.mock.calls).toContainEqual([
      'user-1',
      'hashed',
    ]);
  });

  it('returns mapped users from getAllUsers', async () => {
    userRepository.findAll.mockResolvedValue([
      makeUser({ fullName: 'Test', email: 't@example.com' }),
      makeUser({
        id: 'user-2',
        fullName: 'Test2',
        email: 't2@example.com',
        role: AccountRole.VETERINARIAN,
      }),
    ]);

    const result = await service.getAllUsers();

    expect(result).toEqual([
      {
        id: 'user-1',
        fullName: 'Test',
        email: 't@example.com',
        role: AccountRole.PRODUCER,
      },
      {
        id: 'user-2',
        fullName: 'Test2',
        email: 't2@example.com',
        role: AccountRole.VETERINARIAN,
      },
    ]);
  });

  it('returns null when getUserById does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(service.getUserById('missing')).resolves.toBeNull();
  });

  it('deletes user', async () => {
    await service.deleteUser('user-1');
    expect(userRepository.delete.mock.calls).toContainEqual(['user-1']);
  });

  it('returns conflict when account history prevents deletion', async () => {
    userRepository.delete.mockRejectedValue({ code: '23503' });

    await expect(service.deleteUser('user-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns null when getUserByEmailWithPassword does not exist', async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(null);
    await expect(
      service.getUserByEmailWithPassword('missing@example.com'),
    ).resolves.toBeNull();
  });
});
