import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ICowRepository } from './cow.repository';
import { Cow } from '../cow.entity';
import { BodyConditionScore } from '../body-condition-score.entity';
import { CowOwnershipHistory } from '../cow-ownership-history.entity';
import { CreateCowDto } from '../dto/create-cow.dto';
import { CreateBodyConditionScoreDto } from '../dto/create-body-condition-score.dto';
import { SyncBodyConditionScoreDto } from '../dto/synchronize.dto';
import { CowUpdateData } from './cow.repository';

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
      where: { deleted: false },
      relations: ['bodyConditionScores'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUserId(userId: string): Promise<Cow[]> {
    return await this.cowRepository.find({
      where: { userId, deleted: false },
      relations: ['bodyConditionScores'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Cow | null> {
    return await this.cowRepository.findOneBy({ id, deleted: false });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Cow | null> {
    return await this.cowRepository.findOne({
      where: { id, userId, deleted: false },
    });
  }

  async findByIdWithBcs(id: string): Promise<Cow | null> {
    return await this.cowRepository.findOne({
      where: { id, deleted: false },
      relations: ['bodyConditionScores'],
      order: { bodyConditionScores: { recordedAt: 'DESC' } },
    });
  }

  async findByTagNumber(tagNumber: string): Promise<Cow | null> {
    return await this.cowRepository.findOneBy({ tagNumber, deleted: false });
  }

  async findByTagNumberIncludingDeleted(
    tagNumber: string,
  ): Promise<Cow | null> {
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
        deleted: false,
        syncAt: new Date(),
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

  async update(
    id: string,
    userId: string,
    cowData: CowUpdateData,
  ): Promise<Cow> {
    const existingCow = await this.findByIdAndUserId(id, userId);
    if (!existingCow) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }
    this.cowRepository.merge(existingCow, cowData);
    return await this.cowRepository.save(existingCow);
  }

  async delete(id: string, userId: string): Promise<void> {
    const cow = await this.findByIdAndUserId(id, userId);
    if (!cow) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }
    cow.deleted = true;
    cow.syncAt = new Date();
    await this.cowRepository.save(cow);
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
        throw new NotFoundException(
          'Cow not found or you do not have permission',
        );
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
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }

    const bcs = this.bcsRepository.create({
      ...bcsData,
      recordedAt: new Date(bcsData.recordedAt),
      cowId,
    });
    return await this.bcsRepository.save(bcs);
  }

  async syncBodyConditionScore(
    cowId: string,
    userId: string,
    bcsData: SyncBodyConditionScoreDto,
  ): Promise<{ bcs: BodyConditionScore; created: boolean }> {
    const cow = await this.findByIdAndUserId(cowId, userId);
    if (!cow) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }

    if (bcsData.id) {
      const existing = await this.bcsRepository.findOne({
        where: { id: bcsData.id },
        relations: ['cow'],
      });

      if (existing) {
        if (existing.cow.userId !== userId) {
          throw new ForbiddenException(
            'You do not have permission to edit this record',
          );
        }
        existing.score = bcsData.score ?? existing.score;
        existing.recordedAt = bcsData.recordedAt
          ? new Date(bcsData.recordedAt)
          : existing.recordedAt;
        existing.observation = bcsData.observation ?? existing.observation;
        existing.cowId = cowId;
        existing.deleted = false;
        existing.syncAt = new Date();
        // Only update imageUrl/imagePublicId if provided (not undefined)
        if (bcsData.imageUrl !== undefined) {
          existing.imageUrl = bcsData.imageUrl;
        }
        if (bcsData.imagePublicId !== undefined) {
          existing.imagePublicId = bcsData.imagePublicId;
        }
        return { bcs: await this.bcsRepository.save(existing), created: false };
      }
    }

    const bcs = this.bcsRepository.create({
      id: bcsData.id,
      cowId,
      score: bcsData.score,
      recordedAt: bcsData.recordedAt
        ? new Date(bcsData.recordedAt)
        : new Date(),
      observation: bcsData.observation,
      deleted: false,
      syncAt: new Date(),
      imageUrl: bcsData.imageUrl ?? null,
      imagePublicId: bcsData.imagePublicId ?? null,
    });
    return { bcs: await this.bcsRepository.save(bcs), created: true };
  }

  async findBcsHistory(
    cowId: string,
    userId: string,
  ): Promise<BodyConditionScore[]> {
    const cow = await this.findByIdAndUserId(cowId, userId);
    if (!cow) {
      throw new NotFoundException(
        'Cow not found or you do not have permission',
      );
    }

    return await this.bcsRepository.find({
      where: { cowId, deleted: false },
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
      throw new ForbiddenException(
        'You do not have permission to delete this record',
      );
    }

    bcs.deleted = true;
    bcs.syncAt = new Date();
    await this.bcsRepository.save(bcs);
  }

  async findOwnershipHistory(cowId: string): Promise<CowOwnershipHistory[]> {
    return await this.historyRepository.find({
      where: { cowId },
      order: { transferredAt: 'DESC' },
    });
  }
}
