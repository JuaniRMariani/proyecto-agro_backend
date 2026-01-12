import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICowRepository } from './cow.repository';
import { Cow } from '../cow.entity';
import { BodyConditionScore } from '../body-condition-score.entity';
import { CreateCowDto } from '../dto/create-cow.dto';
import { UpdateCowDto } from '../dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from '../dto/create-body-condition-score.dto';

@Injectable()
export class CowTypeOrmRepository implements ICowRepository {
  constructor(
    @InjectRepository(Cow)
    private readonly cowRepository: Repository<Cow>,
    @InjectRepository(BodyConditionScore)
    private readonly bcsRepository: Repository<BodyConditionScore>,
  ) {}

  async findAll(): Promise<Cow[]> {
    return await this.cowRepository.find({
      relations: ['bodyConditionScores'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Cow | null> {
    return await this.cowRepository.findOneBy({ id });
  }

  async findByIdWithBcs(id: string): Promise<Cow | null> {
    return await this.cowRepository.findOne({
      where: { id },
      relations: ['bodyConditionScores'],
      order: { bodyConditionScores: { recordedAt: 'DESC' } },
    });
  }

  async findByTagNumber(tagNumber: string): Promise<Cow | null> {
    return await this.cowRepository.findOneBy({ tagNumber });
  }

  async create(cow: CreateCowDto): Promise<Cow> {
    const newCow = this.cowRepository.create(cow);
    return await this.cowRepository.save(newCow);
  }

  async update(id: string, cowData: Partial<UpdateCowDto>): Promise<Cow> {
    const existingCow = await this.cowRepository.findOneBy({ id });
    if (!existingCow) {
      throw new NotFoundException('Cow not found');
    }
    this.cowRepository.merge(existingCow, cowData);
    return await this.cowRepository.save(existingCow);
  }

  async delete(id: string): Promise<void> {
    const result = await this.cowRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cow not found');
    }
  }

  async addBodyConditionScore(
    cowId: string,
    bcsData: CreateBodyConditionScoreDto,
  ): Promise<BodyConditionScore> {
    const cow = await this.cowRepository.findOneBy({ id: cowId });
    if (!cow) {
      throw new NotFoundException('Cow not found');
    }

    const bcs = this.bcsRepository.create({
      ...bcsData,
      recordedAt: new Date(bcsData.recordedAt),
      cowId,
    });
    return await this.bcsRepository.save(bcs);
  }

  async findBcsHistory(cowId: string): Promise<BodyConditionScore[]> {
    return await this.bcsRepository.find({
      where: { cowId },
      order: { recordedAt: 'DESC' },
    });
  }

  async deleteBcs(bcsId: string): Promise<void> {
    const result = await this.bcsRepository.delete(bcsId);
    if (result.affected === 0) {
      throw new NotFoundException('Body condition score record not found');
    }
  }
}
