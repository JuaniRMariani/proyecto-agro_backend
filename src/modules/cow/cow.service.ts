import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import type { ICowRepository } from './infra/cow.repository';
import { CreateCowDto } from './dto/create-cow.dto';
import { UpdateCowDto } from './dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from './dto/create-body-condition-score.dto';
import { TransferCowOwnershipDto } from './dto/transfer-cow-ownership.dto';
import { CowResponseDto } from './dto/cow-response.dto';
import { SynchronizeResponseDto } from './dto/synchronize-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';
import { CowOwnershipHistoryResponseDto } from './dto/cow-ownership-history-response.dto';
import {
  cowMapperToResponseDto,
  bcsMapperToResponseDto,
  ownershipHistoryMapperToResponseDto,
} from './cow.mapper';
import { SynchronizeDto } from './dto/synchronize.dto';
import { CowUpdateData } from './infra/cow.repository';
import { OverrideBodyConditionScoreDto } from './dto/override-body-condition-score.dto';
import { BcsScore } from './bcs-score.constants';
import { BodyConditionScore } from './body-condition-score.entity';

@Injectable()
export class CowService {
  constructor(
    @Inject('ICowRepository')
    private readonly cowRepository: ICowRepository,
  ) {}

  async getAllCows(): Promise<CowResponseDto[]> {
    const cows = await this.cowRepository.findAll();
    return cows
      .map((cow) => cowMapperToResponseDto(cow))
      .filter((cow): cow is CowResponseDto => cow !== null);
  }

  async getCowsByUserId(userId: string): Promise<CowResponseDto[]> {
    const cows = await this.cowRepository.findAllByUserId(userId);
    return cows
      .map((cow) => cowMapperToResponseDto(cow))
      .filter((cow): cow is CowResponseDto => cow !== null);
  }

  async getCowById(id: string, userId: string): Promise<CowResponseDto | null> {
    const cow = await this.cowRepository.findByIdWithBcs(id);
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }
    if (cow.userId !== userId) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }
    return cowMapperToResponseDto(cow);
  }

  async getCowByTagNumber(
    tagNumber: string,
    userId: string,
  ): Promise<CowResponseDto | null> {
    const cow = await this.cowRepository.findByTagNumber(tagNumber);
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }
    if (cow.userId !== userId) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }
    return cowMapperToResponseDto(cow);
  }

  async createCow(
    createCowDto: CreateCowDto,
    userId: string,
  ): Promise<CowResponseDto> {
    const existingCow =
      await this.cowRepository.findByTagNumberIncludingDeleted(
        createCowDto.tagNumber,
      );

    if (existingCow) {
      // Si la vaca existe pero está borrada, la restauramos
      if (existingCow.deleted) {
        if (existingCow.userId !== userId) {
          throw new ConflictException(
            'A cow with this tag number already exists',
          );
        }
        const updateData: CowUpdateData = {
          deleted: false,
          syncAt: new Date(),
          weight: createCowDto.weight,
          breed: createCowDto.breed,
        };
        const restoredCow = await this.cowRepository.update(
          existingCow.id,
          userId,
          updateData,
        );
        const mappedCow = cowMapperToResponseDto(restoredCow);
        if (!mappedCow) {
          throw new InternalServerErrorException('Error mapping restored cow');
        }
        return mappedCow;
      }
      // Si la vaca existe y no está borrada, lanzar error
      throw new ConflictException('A cow with this tag number already exists');
    }

    try {
      const newCow = await this.cowRepository.create(createCowDto, userId);
      const mappedCow = cowMapperToResponseDto(newCow);
      if (!mappedCow) {
        throw new InternalServerErrorException('Error mapping created cow');
      }
      return mappedCow;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async updateCow(
    id: string,
    userId: string,
    updateCowDto: UpdateCowDto,
  ): Promise<CowResponseDto | null> {
    if (updateCowDto.tagNumber) {
      const existingCow = await this.cowRepository.findByTagNumber(
        updateCowDto.tagNumber,
      );
      if (existingCow && existingCow.id !== id) {
        throw new ConflictException(
          'A cow with this tag number already exists',
        );
      }
    }

    try {
      const updatedCow = await this.cowRepository.update(
        id,
        userId,
        updateCowDto,
      );
      return cowMapperToResponseDto(updatedCow);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async deleteCow(id: string, userId: string): Promise<void> {
    return this.cowRepository.delete(id, userId);
  }

  async transferOwnership(
    cowId: string,
    currentUserId: string,
    transferDto: TransferCowOwnershipDto,
  ): Promise<CowResponseDto> {
    try {
      const updatedCow = await this.cowRepository.transferOwnership(
        cowId,
        currentUserId,
        transferDto.newUserId,
        transferDto.reason,
      );
      const mappedCow = cowMapperToResponseDto(updatedCow);
      if (!mappedCow) {
        throw new InternalServerErrorException('Error mapping transferred cow');
      }
      return mappedCow;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async addBodyConditionScore(
    cowId: string,
    userId: string,
    bcsDto: CreateBodyConditionScoreDto,
  ): Promise<BodyConditionScoreResponseDto> {
    const bcs = await this.cowRepository.addBodyConditionScore(
      cowId,
      userId,
      bcsDto,
    );
    const mappedBcs = bcsMapperToResponseDto(bcs);
    if (!mappedBcs) {
      throw new InternalServerErrorException(
        'Error mapping body condition score',
      );
    }
    return mappedBcs;
  }

  async getBcsHistory(
    cowId: string,
    userId: string,
  ): Promise<BodyConditionScoreResponseDto[]> {
    const bcsHistory = await this.cowRepository.findBcsHistory(cowId, userId);
    return bcsHistory
      .map((bcs) => bcsMapperToResponseDto(bcs))
      .filter((bcs): bcs is BodyConditionScoreResponseDto => bcs !== null);
  }

  async deleteBcs(bcsId: string, userId: string): Promise<void> {
    return this.cowRepository.deleteBcs(bcsId, userId);
  }

  async overrideBcs(
    bcsId: string,
    userId: string,
    overrideDto: OverrideBodyConditionScoreDto,
  ): Promise<BodyConditionScoreResponseDto> {
    const bcs = await this.cowRepository.overrideBcs(
      bcsId,
      userId,
      overrideDto.score,
      overrideDto.reason,
    );
    return this.requireMappedBcs(bcs);
  }

  async revertBcsOverride(
    bcsId: string,
    userId: string,
  ): Promise<BodyConditionScoreResponseDto> {
    const bcs = await this.cowRepository.revertBcsOverride(bcsId, userId);
    return this.requireMappedBcs(bcs);
  }

  async applyProfessionalRecommendation(
    bcsId: string,
    producerId: string,
    score: BcsScore,
    reviewId: string,
  ): Promise<BodyConditionScoreResponseDto> {
    const bcs = await this.cowRepository.applyProfessionalRecommendation(
      bcsId,
      producerId,
      score,
      reviewId,
    );
    return this.requireMappedBcs(bcs);
  }

  async getOwnershipHistory(
    cowId: string,
    userId: string,
  ): Promise<CowOwnershipHistoryResponseDto[]> {
    const cow = await this.cowRepository.findByIdAndUserId(cowId, userId);
    if (!cow) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }

    const history = await this.cowRepository.findOwnershipHistory(cowId);
    return history
      .map((record) => ownershipHistoryMapperToResponseDto(record))
      .filter(
        (record): record is CowOwnershipHistoryResponseDto => record !== null,
      );
  }

  async synchronize(
    userId: string,
    payload: SynchronizeDto,
  ): Promise<SynchronizeResponseDto> {
    const result = {
      cows: { created: 0, updated: 0, deleted: 0, skipped: 0 },
      scores: { created: 0, updated: 0, deleted: 0, skipped: 0 },
    };

    const cows = payload.cows ?? [];
    const scores = payload.scores ?? [];

    for (const cow of cows) {
      const existing = await this.cowRepository.findByTagNumberIncludingDeleted(
        cow.tagNumber,
      );

      if (cow.deleted) {
        if (existing && existing.userId === userId) {
          await this.cowRepository.delete(existing.id, userId);
          result.cows.deleted += 1;
        } else {
          result.cows.skipped += 1;
        }
        continue;
      }

      if (existing) {
        if (existing.userId !== userId) {
          throw new ConflictException(
            'A cow with this tag number already exists',
          );
        }

        const incomingUpdatedAt = this.toEpochMs(cow.updatedAt);
        if (
          incomingUpdatedAt !== null &&
          existing.updatedAt &&
          incomingUpdatedAt <= existing.updatedAt.getTime()
        ) {
          result.cows.skipped += 1;
          continue;
        }

        const updateData: CowUpdateData = {
          deleted: false,
          syncAt: new Date(),
        };
        if (cow.tagNumber) {
          updateData.tagNumber = cow.tagNumber;
        }
        if (cow.weight !== undefined) {
          updateData.weight = cow.weight;
        }
        if (cow.breed !== undefined) {
          updateData.breed = cow.breed;
        }
        await this.cowRepository.update(existing.id, userId, updateData);
        result.cows.updated += 1;
      } else {
        await this.cowRepository.create(
          {
            tagNumber: cow.tagNumber,
            weight: cow.weight ?? undefined,
            breed: cow.breed ?? undefined,
          },
          userId,
        );
        result.cows.created += 1;
      }
    }

    for (const score of scores) {
      if (score.deleted) {
        if (score.id) {
          await this.cowRepository.deleteBcs(score.id, userId);
          result.scores.deleted += 1;
        } else {
          result.scores.skipped += 1;
        }
        continue;
      }

      if (score.score === undefined || score.recordedAt === undefined) {
        throw new BadRequestException(
          'Score and recordedAt are required for body condition scores',
        );
      }

      const cow = await this.cowRepository.findByTagNumber(score.cowTagNumber);
      if (!cow || cow.userId !== userId) {
        result.scores.skipped += 1;
        continue;
      }

      const { created } = await this.cowRepository.syncBodyConditionScore(
        cow.id,
        userId,
        score,
      );
      if (created) {
        result.scores.created += 1;
      } else {
        result.scores.updated += 1;
      }
    }

    const cowsSnapshot = await this.cowRepository.findAllByUserId(userId);
    const data = cowsSnapshot
      .map((cow) => cowMapperToResponseDto(cow))
      .filter((cow): cow is CowResponseDto => cow !== null);

    return { ...result, data };
  }

  private handleDbError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException('A cow with this tag number already exists');
    }
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('Unexpected error occurred');
  }

  private requireMappedBcs(
    bcs: BodyConditionScore,
  ): BodyConditionScoreResponseDto {
    const mappedBcs = bcsMapperToResponseDto(bcs);
    if (!mappedBcs) {
      throw new InternalServerErrorException(
        'Error mapping body condition score',
      );
    }
    return mappedBcs;
  }

  private toEpochMs(value?: number): number | null {
    if (value === undefined || value === null) {
      return null;
    }
    return Number.isFinite(value) ? value : null;
  }
}
