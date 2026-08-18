import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { CreateProfessionalReviewDto } from './dto/create-professional-review.dto';
import { ListProfessionalReviewsQueryDto } from './dto/list-professional-reviews-query.dto';
import { ProfessionalReviewResponseDto } from './dto/professional-review-response.dto';
import { UpdateProfessionalReviewDto } from './dto/update-professional-review.dto';
import { ProfessionalReviewService } from './professional-review.service';
import { BodyConditionScoreResponseDto } from '../cow/dto/body-condition-score-response.dto';

@ApiTags('professional-reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('professional-reviews')
export class ProfessionalReviewController {
  constructor(
    private readonly professionalReviewService: ProfessionalReviewService,
  ) {}

  @Post()
  @ResponseMessage('Devolución profesional creada exitosamente')
  @ApiCreatedResponse({ type: ProfessionalReviewResponseDto })
  createReview(
    @Request() request: AuthenticatedRequest,
    @Body() createDto: CreateProfessionalReviewDto,
  ): Promise<ProfessionalReviewResponseDto> {
    return this.professionalReviewService.createReview(request.user, createDto);
  }

  @Get()
  @ResponseMessage('Devoluciones profesionales obtenidas exitosamente')
  @ApiOkResponse({ type: ProfessionalReviewResponseDto, isArray: true })
  listReviews(
    @Request() request: AuthenticatedRequest,
    @Query() query: ListProfessionalReviewsQueryDto,
  ): Promise<ProfessionalReviewResponseDto[]> {
    return this.professionalReviewService.listReviews(request.user, query);
  }

  @Patch(':id')
  @ResponseMessage('Devolución profesional actualizada exitosamente')
  @ApiOkResponse({ type: ProfessionalReviewResponseDto })
  updateReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
    @Body() updateDto: UpdateProfessionalReviewDto,
  ): Promise<ProfessionalReviewResponseDto> {
    return this.professionalReviewService.updateReview(
      request.user,
      id,
      updateDto,
    );
  }

  @Post(':id/apply-score')
  @ResponseMessage('Sugerencia profesional aplicada exitosamente')
  @ApiOkResponse({ type: BodyConditionScoreResponseDto })
  applySuggestedScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<BodyConditionScoreResponseDto> {
    return this.professionalReviewService.applySuggestedScore(request.user, id);
  }
}
