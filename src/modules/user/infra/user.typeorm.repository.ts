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
    const newUser = await this.typeOrmRepo.create(user);
    return await this.typeOrmRepo.save(newUser);
  }

  async update(id: string, user: Partial<UpdateUserDto>): Promise<User> {
    const existingUser = await this.typeOrmRepo.findOneBy({ id });
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    this.typeOrmRepo.merge(existingUser, user);
    return await this.typeOrmRepo.save(existingUser);
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
    await this.typeOrmRepo.update(id, { password: newPassword });
  }

  async saveVerificationCode(
    id: string,
    code: string,
    expiration: Date,
  ): Promise<void> {
    await this.typeOrmRepo.update(id, {
      resetPasswordToken: code,
      resetPasswordExpires: expiration,
    });
  }

  async clearVerificationCode(id: string): Promise<void> {
    await this.typeOrmRepo.update(id, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async findByVerificationCode(code: string): Promise<User | null> {
    const currentTime = new Date();
    return await this.typeOrmRepo
      .createQueryBuilder('user')
      .where('user.resetPasswordToken = :code', { code })
      .andWhere('user.resetPasswordExpires > :currentTime', { currentTime })
      .getOne();
  }
}
