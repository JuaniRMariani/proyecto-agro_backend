import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CowService } from './cow.service';
import { CowResponseDto } from './dto/cow-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';
import { CowOwnershipHistoryResponseDto } from './dto/cow-ownership-history-response.dto';
import { CreateCowDto } from './dto/create-cow.dto';
import { UpdateCowDto } from './dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from './dto/create-body-condition-score.dto';
import { TransferCowOwnershipDto } from './dto/transfer-cow-ownership.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { SynchronizeDto } from './dto/synchronize.dto';
import { SynchronizeResponseDto } from './dto/synchronize-response.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { OverrideBodyConditionScoreDto } from './dto/override-body-condition-score.dto';

@Controller('cows')
@ApiTags('cows')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class CowController {
  constructor(private readonly cowService: CowService) {}

  @ResponseMessage('Cows retrieved successfully')
  @Get()
  @ApiOkResponse({ type: CowResponseDto, isArray: true })
  async getMyCows(
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto[]> {
    return this.cowService.getCowsByUserId(request.user.userId);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get(':id')
  @ApiOkResponse({ type: CowResponseDto })
  async getCowById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowById(id, request.user.userId);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get('tag/:tagNumber')
  @ApiOkResponse({ type: CowResponseDto })
  async getCowByTagNumber(
    @Param('tagNumber') tagNumber: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowByTagNumber(tagNumber, request.user.userId);
  }

  @ResponseMessage('Cow created successfully')
  @Post()
  @ApiCreatedResponse({ type: CowResponseDto })
  async createCow(
    @Body() createCowDto: CreateCowDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto> {
    return this.cowService.createCow(createCowDto, request.user.userId);
  }

  @ResponseMessage('Synchronization completed successfully')
  @Post('synchronize')
  @ApiOkResponse({
    type: SynchronizeResponseDto,
    schema: {
      example: {
        cows: { created: 1, updated: 0, deleted: 0, skipped: 0 },
        scores: { created: 1, updated: 0, deleted: 0, skipped: 0 },
        data: [
          {
            id: '165ab8ad-b614-4d2e-89a7-366aee70e94a',
            tagNumber: '530',
            weight: 900,
            userId: '3b6efa53-e23f-4bda-adf5-29ae714acac4',
            bodyConditionScores: [
              {
                id: '73583dc2-e179-4931-b495-1f85c1382152',
                score: 3,
                recordedAt: '2026-01-22T00:00:00.000Z',
                observation: 'Observation notes',
                cowId: '165ab8ad-b614-4d2e-89a7-366aee70e94a',
                createdAt: '2026-01-22T00:00:00.000Z',
              },
            ],
            createdAt: '2026-01-22T00:00:00.000Z',
            updatedAt: '2026-01-22T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async synchronize(
    @Body() synchronizeDto: SynchronizeDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<SynchronizeResponseDto> {
    return this.cowService.synchronize(request.user.userId, synchronizeDto);
  }

  @ResponseMessage('Cow updated successfully')
  @Put(':id')
  @ApiOkResponse({ type: CowResponseDto })
  async updateCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCowDto: UpdateCowDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto | null> {
    return this.cowService.updateCow(id, request.user.userId, updateCowDto);
  }

  @ResponseMessage('Cow deleted successfully')
  @Delete(':id')
  @ApiOkResponse({
    schema: { example: { message: 'Cow deleted successfully' } },
  })
  async deleteCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.cowService.deleteCow(id, request.user.userId);
  }

  @ResponseMessage('Cow ownership transferred successfully')
  @Post(':id/transfer')
  @ApiOkResponse({ type: CowResponseDto })
  async transferOwnership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transferDto: TransferCowOwnershipDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowResponseDto> {
    return this.cowService.transferOwnership(
      id,
      request.user.userId,
      transferDto,
    );
  }

  @ResponseMessage('Ownership history retrieved successfully')
  @Get(':id/history')
  @ApiOkResponse({ type: CowOwnershipHistoryResponseDto, isArray: true })
  async getOwnershipHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<CowOwnershipHistoryResponseDto[]> {
    return this.cowService.getOwnershipHistory(id, request.user.userId);
  }

  @ResponseMessage('Body condition score added successfully')
  @Post(':id/bcs')
  @ApiCreatedResponse({ type: BodyConditionScoreResponseDto })
  async addBodyConditionScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bcsDto: CreateBodyConditionScoreDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.cowService.addBodyConditionScore(
      id,
      request.user.userId,
      bcsDto,
    );
  }

  @ResponseMessage('Body condition score history retrieved successfully')
  @Get(':id/bcs')
  @ApiOkResponse({ type: BodyConditionScoreResponseDto, isArray: true })
  async getBcsHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<BodyConditionScoreResponseDto[]> {
    return this.cowService.getBcsHistory(id, request.user.userId);
  }

  @ResponseMessage('Body condition score overridden successfully')
  @Patch('bcs/:bcsId/override')
  @ApiOkResponse({ type: BodyConditionScoreResponseDto })
  overrideBcs(
    @Param('bcsId', ParseUUIDPipe) bcsId: string,
    @Body() overrideDto: OverrideBodyConditionScoreDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.cowService.overrideBcs(bcsId, request.user.userId, overrideDto);
  }

  @ResponseMessage('Body condition score override reverted successfully')
  @Delete('bcs/:bcsId/override')
  @ApiOkResponse({ type: BodyConditionScoreResponseDto })
  revertBcsOverride(
    @Param('bcsId', ParseUUIDPipe) bcsId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.cowService.revertBcsOverride(bcsId, request.user.userId);
  }

  @ResponseMessage('Body condition score deleted successfully')
  @Delete('bcs/:bcsId')
  @ApiOkResponse({
    schema: {
      example: { message: 'Body condition score deleted successfully' },
    },
  })
  async deleteBcs(
    @Param('bcsId', ParseUUIDPipe) bcsId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.cowService.deleteBcs(bcsId, request.user.userId);
  }
}
