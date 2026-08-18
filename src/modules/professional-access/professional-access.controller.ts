import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CowResponseDto } from '../cow/dto/cow-response.dto';
import { ProfessionalAccessResponseDto } from './dto/professional-access-response.dto';
import { ProfessionalClientResponseDto } from './dto/professional-client-response.dto';
import { RequestProfessionalAccessDto } from './dto/request-professional-access.dto';
import { ProfessionalAccessService } from './professional-access.service';

@ApiTags('professional-access')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('professional-access')
export class ProfessionalAccessController {
  constructor(
    private readonly professionalAccessService: ProfessionalAccessService,
  ) {}

  @Post('requests')
  @ResponseMessage('Solicitud profesional creada exitosamente')
  @ApiCreatedResponse({ type: ProfessionalAccessResponseDto })
  requestAccess(
    @Request() request: AuthenticatedRequest,
    @Body() requestDto: RequestProfessionalAccessDto,
  ): Promise<ProfessionalAccessResponseDto> {
    return this.professionalAccessService.requestAccess(
      request.user,
      requestDto,
    );
  }

  @Get()
  @ResponseMessage('Vínculos profesionales obtenidos exitosamente')
  @ApiOkResponse({ type: ProfessionalAccessResponseDto, isArray: true })
  listProducerAccess(
    @Request() request: AuthenticatedRequest,
  ): Promise<ProfessionalAccessResponseDto[]> {
    return this.professionalAccessService.listProducerAccess(request.user);
  }

  @Get('requests')
  @ResponseMessage('Solicitudes profesionales obtenidas exitosamente')
  @ApiOkResponse({ type: ProfessionalAccessResponseDto, isArray: true })
  listPendingRequests(
    @Request() request: AuthenticatedRequest,
  ): Promise<ProfessionalAccessResponseDto[]> {
    return this.professionalAccessService.listPendingRequests(request.user);
  }

  @Post(':id/accept')
  @ResponseMessage('Solicitud profesional aceptada exitosamente')
  @ApiOkResponse({ type: ProfessionalAccessResponseDto })
  acceptRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<ProfessionalAccessResponseDto> {
    return this.professionalAccessService.acceptRequest(request.user, id);
  }

  @Post(':id/reject')
  @ResponseMessage('Solicitud profesional rechazada exitosamente')
  @ApiOkResponse({ type: ProfessionalAccessResponseDto })
  rejectRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<ProfessionalAccessResponseDto> {
    return this.professionalAccessService.rejectRequest(request.user, id);
  }

  @Delete(':id')
  @ResponseMessage('Vínculo profesional revocado exitosamente')
  @ApiOkResponse({
    schema: {
      example: { message: 'Vínculo profesional revocado exitosamente' },
    },
  })
  revokeAccess(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.professionalAccessService.revokeAccess(request.user, id);
  }

  @Get('clients')
  @ResponseMessage('Clientes obtenidos exitosamente')
  @ApiOkResponse({ type: ProfessionalClientResponseDto, isArray: true })
  listClients(
    @Request() request: AuthenticatedRequest,
  ): Promise<ProfessionalClientResponseDto[]> {
    return this.professionalAccessService.listClients(request.user);
  }

  @Get('clients/:producerId/cows')
  @ResponseMessage('Ganado del cliente obtenido exitosamente')
  @ApiOkResponse({ type: CowResponseDto, isArray: true })
  getClientCows(
    @Param('producerId', ParseUUIDPipe) producerId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto[]> {
    return this.professionalAccessService.getClientCows(
      request.user,
      producerId,
    );
  }
}
