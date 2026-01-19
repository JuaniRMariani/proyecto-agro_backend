import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ICowRepository } from './cow.repository';
import { Cow } from '../cow.entity';
import { BodyConditionScore } from '../body-condition-score.entity';
import { CowOwnershipHistory } from '../cow-ownership-history.entity';
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
    @InjectRepository(CowOwnershipHistory)
    private readonly historyRepository: Repository<CowOwnershipHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Cow[]> {
    return await this.cowRepository.find({
      relations: ['bodyConditionScores'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUserId(userId: string): Promise<Cow[]> {
    return await this.cowRepository.find({
      where: { userId },
      relations: ['bodyConditionScores'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Cow | null> {
    return await this.cowRepository.findOneBy({ id });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Cow | null> {
    return await this.cowRepository.findOne({
      where: { id, userId },
    });
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

  async create(cowData: CreateCowDto, userId: string): Promise<Cow> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newCow = this.cowRepository.create({
        ...cowData,
        userId,
      });
      const savedCow = await queryRunner.manager.save(newCow);

      // Create initial ownership history
      const history = this.historyRepository.create({
        cowId: savedCow.id,
        previousUserId: null,
        newUserId: userId,
        reason: 'Initial registration',
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return savedCow;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, userId: string, cowData: Partial<UpdateCowDto>): Promise<Cow> {
    const existingCow = await this.findByIdAndUserId(id, userId);
    if (!existingCow) {
      throw new NotFoundException('Cow not found or you do not have permission');
    }
    this.cowRepository.merge(existingCow, cowData);
    return await this.cowRepository.save(existingCow);
  }

  async delete(id: string, userId: string): Promise<void> {
    const cow = await this.findByIdAndUserId(id, userId);
    if (!cow) {
      throw new NotFoundException('Cow not found or you do not have permission');
    }
    await this.cowRepository.delete(id);
  }

  async transferOwnership(
    cowId: string,
    currentUserId: string,
    newUserId: string,
    reason?: string,
  ): Promise<Cow> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cow = await this.findByIdAndUserId(cowId, currentUserId);
      if (!cow) {
        throw new NotFoundException('Cow not found or you do not have permission');
      }

      // Update cow ownership
      cow.userId = newUserId;
      const updatedCow = await queryRunner.manager.save(cow);

      // Create ownership history record
      const history = this.historyRepository.create({
        cowId,
        previousUserId: currentUserId,
        newUserId,
        reason: reason || 'Ownership transfer',
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return updatedCow;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addBodyConditionScore(
    cowId: string,
    userId: string,
    bcsData: CreateBodyConditionScoreDto,
  ): Promise<BodyConditionScore> {
    const cow = await this.findByIdAndUserId(cowId, userId);
    if (!cow) {
      throw new NotFoundException('Cow not found or you do not have permission');
    }

    const bcs = this.bcsRepository.create({
      ...bcsData,
      recordedAt: new Date(bcsData.recordedAt),
      cowId,
    });
    return await this.bcsRepository.save(bcs);
  }

  async findBcsHistory(cowId: string, userId: string): Promise<BodyConditionScore[]> {
    const cow = await this.findByIdAndUserId(cowId, userId);
    if (!cow) {
      throw new NotFoundException('Cow not found or you do not have permission');
    }

    return await this.bcsRepository.find({
      where: { cowId },
      order: { recordedAt: 'DESC' },
    });
  }

  async deleteBcs(bcsId: string, userId: string): Promise<void> {
    const bcs = await this.bcsRepository.findOne({
      where: { id: bcsId },
      relations: ['cow'],
    });

    if (!bcs) {
      throw new NotFoundException('Body condition score record not found');
    }

    if (bcs.cow.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this record');
    }

    await this.bcsRepository.delete(bcsId);
  }

  async findOwnershipHistory(cowId: string): Promise<CowOwnershipHistory[]> {
    return await this.historyRepository.find({
      where: { cowId },
      order: { transferredAt: 'DESC' },
    });
  }
}
