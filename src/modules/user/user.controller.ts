import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('user')
export class UserController {

    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    @Get()
    async getUser() : Promise<UserResponseDto[]> {
        const userToReturn = await this.userService.getAllUsers();
        return userToReturn;
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) : Promise<UserResponseDto | null> {
        const userToReturn = await this.userService.getUserById(id);
        return userToReturn;
    }
}
