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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CowService } from './cow.service';
import { CowResponseDto } from './dto/cow-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';
import { CreateCowDto } from './dto/create-cow.dto';
import { UpdateCowDto } from './dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from './dto/create-body-condition-score.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('cows')
@UseGuards(AuthGuard('jwt'))
export class CowController {
  constructor(private readonly cowService: CowService) {}

  @ResponseMessage('Cows retrieved successfully')
  @Get()
  async getAllCows(): Promise<CowResponseDto[]> {
    return this.cowService.getAllCows();
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get(':id')
  async getCowById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowById(id);
  }

  @ResponseMessage('Cow retrieved successfully')
  @Get('tag/:tagNumber')
  async getCowByTagNumber(
    @Param('tagNumber') tagNumber: string,
  ): Promise<CowResponseDto | null> {
    return this.cowService.getCowByTagNumber(tagNumber);
  }

  @ResponseMessage('Cow created successfully')
  @Post()
  async createCow(@Body() createCowDto: CreateCowDto): Promise<CowResponseDto> {
    return this.cowService.createCow(createCowDto);
  }

  @ResponseMessage('Cow updated successfully')
  @Put(':id')
  async updateCow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCowDto: UpdateCowDto,
  ): Promise<CowResponseDto | null> {
    return this.cowService.updateCow(id, updateCowDto);
  }

  @ResponseMessage('Cow deleted successfully')
  @Delete(':id')
  async deleteCow(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cowService.deleteCow(id);
  }

  @ResponseMessage('Body condition score added successfully')
  @Post(':id/bcs')
  async addBodyConditionScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bcsDto: CreateBodyConditionScoreDto,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.cowService.addBodyConditionScore(id, bcsDto);
  }

  @ResponseMessage('Body condition score history retrieved successfully')
  @Get(':id/bcs')
  async getBcsHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BodyConditionScoreResponseDto[]> {
    return this.cowService.getBcsHistory(id);
  }

  @ResponseMessage('Body condition score deleted successfully')
  @Delete('bcs/:bcsId')
  async deleteBcs(
    @Param('bcsId', ParseUUIDPipe) bcsId: string,
  ): Promise<void> {
    return this.cowService.deleteBcs(bcsId);
  }
}
