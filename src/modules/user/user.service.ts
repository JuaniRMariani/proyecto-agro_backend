import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from './infra/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { userMapperToResponseDto } from './user.mapper';
import { User } from './user.entity';
import { AccountRole } from './account-role.enum';

function hasDatabaseErrorCode(error: unknown, expectedCode: string): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { code?: unknown };
  return candidate.code === expectedCode;
}

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users
      .map((user) => userMapperToResponseDto(user))
      .filter((user): user is UserResponseDto => user !== null);
  }

  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return userMapperToResponseDto(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try {
      const newUser = await this.userRepository.create({
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        role: createUserDto.role ?? AccountRole.PRODUCER,
        password: hashedPassword,
      });
      const mappedUser = userMapperToResponseDto(newUser);
      if (!mappedUser) throw new Error('Error al mapear el usuario creado');
      return mappedUser;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async updateUser(
    id: string,
    userData: Partial<UpdateUserDto>,
  ): Promise<UserResponseDto | null> {
    if (
      userData.passwordConfirmation !== undefined &&
      userData.password !== userData.passwordConfirmation
    ) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    try {
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
      }
      delete userData.passwordConfirmation;
      const updatedUser = await this.userRepository.update(id, userData);
      const mappedUser = userMapperToResponseDto(updatedUser);
      if (!mappedUser) return null;
      return mappedUser;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      if (hasDatabaseErrorCode(error, '23503')) {
        throw new ConflictException(
          'Las cuentas con historial o vÃ­nculos deben conservarse',
        );
      }
      throw new InternalServerErrorException(
        'No fue posible eliminar la cuenta',
      );
    }
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    return userMapperToResponseDto(user);
  }

  async getUserByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    return user;
  }

  async saveVerificationCode(
    id: string,
    code: string,
    expiration: Date,
  ): Promise<void> {
    return this.userRepository.saveVerificationCode(id, code, expiration);
  }

  async clearVerificationCode(id: string): Promise<void> {
    return this.userRepository.clearVerificationCode(id);
  }

  async findByVerificationCode(code: string): Promise<User | null> {
    return this.userRepository.findByVerificationCode(code);
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userRepository.changePassword(id, hashedPassword);
  }

  private handleDbError(error: unknown): never {
    if (hasDatabaseErrorCode(error, '23505')) {
      throw new ConflictException('El email ya está registrado en el sistema');
    }

    throw new InternalServerErrorException(
      'Error inesperado al crear el usuario',
    );
  }
}
