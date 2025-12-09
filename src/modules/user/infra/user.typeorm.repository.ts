import { Injectable } from "@nestjs/common";
import { IUserRepository } from "./user.repository";
import { User } from "../user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {

    findAll(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    create(user: Partial<CreateUserDto>): Promise<User> {
        throw new Error("Method not implemented.");
    }
    update(id: string, user: Partial<UpdateUserDto>): Promise<User> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}