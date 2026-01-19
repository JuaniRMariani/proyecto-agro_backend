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

@Controller('cows')
@UseGuards(AuthGuard('jwt'))
export class CowController {
  constructor(private readonly cowService: CowService) {}

  @ResponseMessage('Cows retrieved successfully')
  @Get()
  async getMyCows(@Request() req): Promise<CowResponseDto[]> {
    return this.cowService.getCowsByUserId(req.user.userId);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get(':id')
  async getCowById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowById(id, req.user.userId);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get('tag/:tagNumber')
  async getCowByTagNumber(
    @Param('tagNumber') tagNumber: string,
    @Request() req,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowByTagNumber(tagNumber, req.user.userId);
  }

  @ResponseMessage('Cow created successfully')
  @Post()
  async createCow(
    @Body() createCowDto: CreateCowDto,
    @Request() req,
  ): Promise<CowResponseDto> {
    return this.cowService.createCow(createCowDto, req.user.userId);
  }

  @ResponseMessage('Cow updated successfully')
  @Put(':id')
  async updateCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCowDto: UpdateCowDto,
    @Request() req,
  ): Promise<CowResponseDto | null> {
    return this.cowService.updateCow(id, req.user.userId, updateCowDto);
  }

  @ResponseMessage('Cow deleted successfully')
  @Delete(':id')
  async deleteCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    return this.cowService.deleteCow(id, req.user.userId);
  }

  @ResponseMessage('Cow ownership transferred successfully')
  @Post(':id/transfer')
  async transferOwnership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() transferDto: TransferCowOwnershipDto,
    @Request() req,
  ): Promise<CowResponseDto> {
    return this.cowService.transferOwnership(id, req.user.userId, transferDto);
  }

  @ResponseMessage('Ownership history retrieved successfully')
  @Get(':id/history')
  async getOwnershipHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<CowOwnershipHistoryResponseDto[]> {
    return this.cowService.getOwnershipHistory(id, req.user.userId);
  }

  @ResponseMessage('Body condition score added successfully')
  @Post(':id/bcs')
  async addBodyConditionScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bcsDto: CreateBodyConditionScoreDto,
    @Request() req,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.cowService.addBodyConditionScore(id, req.user.userId, bcsDto);
  }

  @ResponseMessage('Body condition score history retrieved successfully')
  @Get(':id/bcs')
  async getBcsHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<BodyConditionScoreResponseDto[]> {
    return this.cowService.getBcsHistory(id, req.user.userId);
  }

  @ResponseMessage('Body condition score deleted successfully')
  @Delete('bcs/:bcsId')
  async deleteBcs(
    @Param('bcsId', ParseUUIDPipe) bcsId: string,
    @Request() req,
  ): Promise<void> {
    return this.cowService.deleteBcs(bcsId, req.user.userId);
  }
}
