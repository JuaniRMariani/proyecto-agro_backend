import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from './user.repository';
import { User } from '../user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(@InjectRepository(User) private typeOrmRepo: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return await this.typeOrmRepo.find();
  }

  async findById(id: string): Promise<User | null> {
    return await this.typeOrmRepo.findOneBy({ id });
  }

  async create(user: Partial<CreateUserDto>): Promise<User> {
    const newUser = this.typeOrmRepo.create(user);
    return await this.typeOrmRepo.save(newUser);
  }

  async update(id: string, user: Partial<UpdateUserDto>): Promise<User> {
    return this.typeOrmRepo.manager.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      manager.merge(User, existingUser, user);
      if (user.password !== undefined) {
        existingUser.tokenVersion += 1;
      }
      return manager.save(User, existingUser);
    });
  }

  async delete(id: string): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.typeOrmRepo.findOneBy({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.typeOrmRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    await this.update(id, { password: newPassword });
  }
}
