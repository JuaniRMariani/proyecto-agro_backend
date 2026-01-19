import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ICowRepository } from './infra/cow.repository';
import { CreateCowDto } from './dto/create-cow.dto';
import { UpdateCowDto } from './dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from './dto/create-body-condition-score.dto';
import { TransferCowOwnershipDto } from './dto/transfer-cow-ownership.dto';
import { CowResponseDto } from './dto/cow-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';
import { CowOwnershipHistoryResponseDto } from './dto/cow-ownership-history-response.dto';
import { cowMapperToResponseDto, bcsMapperToResponseDto, ownershipHistoryMapperToResponseDto } from './cow.mapper';

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
      throw new NotFoundException('Cow not found or you do not have permission');
    }
    return cowMapperToResponseDto(cow);
  }

  async getCowByTagNumber(tagNumber: string, userId: string): Promise<CowResponseDto | null> {
    const cow = await this.cowRepository.findByTagNumber(tagNumber);
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }
    if (cow.userId !== userId) {
      throw new NotFoundException('Cow not found or you do not have permission');
    }
    return cowMapperToResponseDto(cow);
  }

  async createCow(createCowDto: CreateCowDto, userId: string): Promise<CowResponseDto> {
    const existingCow = await this.cowRepository.findByTagNumber(
      createCowDto.tagNumber,
    );
    if (existingCow) {
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
        throw new ConflictException('A cow with this tag number already exists');
      }
    }

    try {
      const updatedCow = await this.cowRepository.update(id, userId, updateCowDto);
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
    const bcs = await this.cowRepository.addBodyConditionScore(cowId, userId, bcsDto);
    const mappedBcs = bcsMapperToResponseDto(bcs);
    if (!mappedBcs) {
      throw new InternalServerErrorException('Error mapping body condition score');
    }
    return mappedBcs;
  }

  async getBcsHistory(cowId: string, userId: string): Promise<BodyConditionScoreResponseDto[]> {
    const bcsHistory = await this.cowRepository.findBcsHistory(cowId, userId);
    return bcsHistory
      .map((bcs) => bcsMapperToResponseDto(bcs))
      .filter((bcs): bcs is BodyConditionScoreResponseDto => bcs !== null);
  }

  async deleteBcs(bcsId: string, userId: string): Promise<void> {
    return this.cowRepository.deleteBcs(bcsId, userId);
  }

  async getOwnershipHistory(cowId: string, userId: string): Promise<CowOwnershipHistoryResponseDto[]> {
    const cow = await this.cowRepository.findByIdAndUserId(cowId, userId);
    if (!cow) {
      throw new NotFoundException('Cow not found or you do not have permission');
    }

    const history = await this.cowRepository.findOwnershipHistory(cowId);
    return history
      .map((record) => ownershipHistoryMapperToResponseDto(record))
      .filter((record): record is CowOwnershipHistoryResponseDto => record !== null);
  }

  private handleDbError(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException('A cow with this tag number already exists');
    }
    throw new InternalServerErrorException('Unexpected error occurred');
  }
}
