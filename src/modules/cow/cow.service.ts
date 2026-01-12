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
import { CowResponseDto } from './dto/cow-response.dto';
import { BodyConditionScoreResponseDto } from './dto/body-condition-score-response.dto';
import { cowMapperToResponseDto, bcsMapperToResponseDto } from './cow.mapper';

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

  async getCowById(id: string): Promise<CowResponseDto | null> {
    const cow = await this.cowRepository.findByIdWithBcs(id);
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }
    return cowMapperToResponseDto(cow);
  }

  async getCowByTagNumber(tagNumber: string): Promise<CowResponseDto | null> {
    const cow = await this.cowRepository.findByTagNumber(tagNumber);
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }
    return cowMapperToResponseDto(cow);
  }

  async createCow(createCowDto: CreateCowDto): Promise<CowResponseDto> {
    const existingCow = await this.cowRepository.findByTagNumber(
      createCowDto.tagNumber,
    );
    if (existingCow) {
      throw new ConflictException('A cow with this tag number already exists');
    }

    try {
      const newCow = await this.cowRepository.create(createCowDto);
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
      const updatedCow = await this.cowRepository.update(id, updateCowDto);
      return cowMapperToResponseDto(updatedCow);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async deleteCow(id: string): Promise<void> {
    return this.cowRepository.delete(id);
  }

  async addBodyConditionScore(
    cowId: string,
    bcsDto: CreateBodyConditionScoreDto,
  ): Promise<BodyConditionScoreResponseDto> {
    const bcs = await this.cowRepository.addBodyConditionScore(cowId, bcsDto);
    const mappedBcs = bcsMapperToResponseDto(bcs);
    if (!mappedBcs) {
      throw new InternalServerErrorException('Error mapping body condition score');
    }
    return mappedBcs;
  }

  async getBcsHistory(cowId: string): Promise<BodyConditionScoreResponseDto[]> {
    const cow = await this.cowRepository.findById(cowId);
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }

    const bcsHistory = await this.cowRepository.findBcsHistory(cowId);
    return bcsHistory
      .map((bcs) => bcsMapperToResponseDto(bcs))
      .filter((bcs): bcs is BodyConditionScoreResponseDto => bcs !== null);
  }

  async deleteBcs(bcsId: string): Promise<void> {
    return this.cowRepository.deleteBcs(bcsId);
  }

  private handleDbError(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException('A cow with this tag number already exists');
    }
    throw new InternalServerErrorException('Unexpected error occurred');
  }
}
