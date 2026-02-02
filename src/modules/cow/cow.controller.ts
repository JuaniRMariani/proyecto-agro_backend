import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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

@Controller('cows')
@ApiTags('cows')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class CowController {
  constructor(private readonly cowService: CowService) {}

  @ResponseMessage('Cows retrieved successfully')
  @Get()
  @ApiOkResponse({ type: CowResponseDto, isArray: true })
  async getMyCows(@Request() req): Promise<CowResponseDto[]> {
    return this.cowService.getCowsByUserId(req.user.userId);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get(':id')
  @ApiOkResponse({ type: CowResponseDto })
  async getCowById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowById(id, req.user.userId);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get('tag/:tagNumber')
  @ApiOkResponse({ type: CowResponseDto })
  async getCowByTagNumber(
    @Param('tagNumber') tagNumber: string,
    @Request() req,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowByTagNumber(tagNumber, req.user.userId);
  }

  @ResponseMessage('Cow created successfully')
  @Post()
  @ApiCreatedResponse({ type: CowResponseDto })
  async createCow(
    @Body() createCowDto: CreateCowDto,
    @Request() req,
  ): Promise<CowResponseDto> {
    return this.cowService.createCow(createCowDto, req.user.userId);
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
    @Request() req,
  ): Promise<SynchronizeResponseDto> {
    return this.cowService.synchronize(req.user.userId, synchronizeDto);
  }

  @ResponseMessage('Cow updated successfully')
  @Put(':id')
  @ApiOkResponse({ type: CowResponseDto })
  async updateCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCowDto: UpdateCowDto,
    @Request() req,
  ): Promise<CowResponseDto | null> {
    return this.cowService.updateCow(id, req.user.userId, updateCowDto);
  }

  @ResponseMessage('Cow deleted successfully')
  @Delete(':id')
  @ApiOkResponse({
    schema: { example: { message: 'Cow deleted successfully' } },
  })
  async deleteCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    return this.cowService.deleteCow(id, req.user.userId);
  }

  @ResponseMessage('Cow ownership transferred successfully')
  @Post(':id/transfer')
  @ApiOkResponse({ type: CowResponseDto })
  async transferOwnership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transferDto: TransferCowOwnershipDto,
    @Request() req,
  ): Promise<CowResponseDto> {
    return this.cowService.transferOwnership(id, req.user.userId, transferDto);
  }

  @ResponseMessage('Ownership history retrieved successfully')
  @Get(':id/history')
  @ApiOkResponse({ type: CowOwnershipHistoryResponseDto, isArray: true })
  async getOwnershipHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<CowOwnershipHistoryResponseDto[]> {
    return this.cowService.getOwnershipHistory(id, req.user.userId);
  }

  @ResponseMessage('Body condition score added successfully')
  @Post(':id/bcs')
  @ApiCreatedResponse({ type: BodyConditionScoreResponseDto })
  async addBodyConditionScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bcsDto: CreateBodyConditionScoreDto,
    @Request() req,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.cowService.addBodyConditionScore(id, req.user.userId, bcsDto);
  }

  @ResponseMessage('Body condition score history retrieved successfully')
  @Get(':id/bcs')
  @ApiOkResponse({ type: BodyConditionScoreResponseDto, isArray: true })
  async getBcsHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<BodyConditionScoreResponseDto[]> {
    return this.cowService.getBcsHistory(id, req.user.userId);
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
    @Request() req,
  ): Promise<void> {
    return this.cowService.deleteBcs(bcsId, req.user.userId);
  }
}
