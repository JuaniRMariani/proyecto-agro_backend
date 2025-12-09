import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from './infra/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { userMapperToResponseDto } from './user.mapper';

@Injectable()
export class UserService {

    constructor( 
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) {}

    async getAllUsers() : Promise<UserResponseDto[]> {
        const users = await this.userRepository.findAll();
        return users
            .map(user => userMapperToResponseDto(user))
            .filter((user): user is UserResponseDto => user !== null);
    }

    async getUserById(id: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findById(id);
        if (!user) return null;
        return userMapperToResponseDto(user);
    }

    async createUser(userData: Partial<CreateUserDto>) : Promise<UserResponseDto> {
        const newUser = await this.userRepository.create(userData);
        const mappedUser = userMapperToResponseDto(newUser);
        if (!mappedUser) throw new Error('User mapping failed');
        return mappedUser;
    }

    async updateUser(id: string, userData: Partial<UpdateUserDto>) : Promise<UserResponseDto | null> {
        const updatedUser = await this.userRepository.update(id, userData);
        const mappedUser = userMapperToResponseDto(updatedUser);
        if (!mappedUser) return null;
        return mappedUser;
    }

    async deleteUser(id: string) : Promise<void> {
        return this.userRepository.delete(id);
    }


}
