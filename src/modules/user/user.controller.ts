import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('user')
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @ResponseMessage('Usuarios obtenidos exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsers(): Promise<UserResponseDto[]> {
    const userToReturn = await this.userService.getAllUsers();
    return userToReturn;
  }

  @ResponseMessage('Usuario obtenido exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUserById(@Request() req): Promise<UserResponseDto | null> {
    const userToReturn = await this.userService.getUserById(req.user.userId);
    return userToReturn;
  }

  @ResponseMessage('Usuario creado exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createUser(@Body() newUser: CreateUserDto): Promise<UserResponseDto> {
    const userToReturn = await this.userService.createUser(newUser);
    return userToReturn;
  }

  @ResponseMessage('Usuario actualizado exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateUser(
    @Request() req,
    @Body() updatedUser: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    const userToReturn = await this.userService.updateUser(
      req.user.userId,
      updatedUser,
    );
    return userToReturn;
  }

  @ResponseMessage('Usuario eliminado exitosamente')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
