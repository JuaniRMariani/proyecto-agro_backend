import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from './infra/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { userMapperToResponseDto } from './user.mapper';
import { User } from './user.entity';

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
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await this.userRepository.create({
        ...userData,
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
    try {
      const updatedUser = await this.userRepository.update(id, userData);
      const mappedUser = userMapperToResponseDto(updatedUser);
      if (!mappedUser) return null;
      return mappedUser;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');
    return userMapperToResponseDto(user);
  }

  async getUserByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) throw new Error('Las credenciales ingresadas son incorrectas');
    return user;
  }

  private handleDbError(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException('El email ya está registrado en el sistema');
    }

    throw new InternalServerErrorException(
      'Error inesperado al crear el usuario',
    );
  }
}
