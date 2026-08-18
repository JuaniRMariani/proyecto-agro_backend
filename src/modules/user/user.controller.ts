import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ResponseMessage('Usuario obtenido exitosamente')
  @Get()
  @ApiOkResponse({ type: UserResponseDto })
  getProfile(
    @Request() request: AuthenticatedRequest,
  ): Promise<UserResponseDto | null> {
    return this.userService.getUserById(request.user.userId);
  }

  @ResponseMessage('Usuario obtenido exitosamente')
  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  getUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<UserResponseDto | null> {
    this.assertSelf(id, request.user.userId);
    return this.userService.getUserById(request.user.userId);
  }

  @ResponseMessage('Usuario actualizado exitosamente')
  @Put()
  @ApiOkResponse({ type: UserResponseDto })
  updateUser(
    @Request() request: AuthenticatedRequest,
    @Body() updatedUser: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    return this.userService.updateUser(request.user.userId, updatedUser);
  }

  @ResponseMessage('Usuario eliminado exitosamente')
  @Delete(':id')
  @ApiOkResponse({
    schema: { example: { message: 'Usuario eliminado exitosamente' } },
  })
  deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<void> {
    this.assertSelf(id, request.user.userId);
    return this.userService.deleteUser(request.user.userId);
  }

  private assertSelf(requestedUserId: string, actorUserId: string): void {
    if (requestedUserId !== actorUserId) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
