import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessionalAccessStatus } from '../professional-access-status.enum';
import { ProfessionalAccess } from '../professional-access.entity';
import { IProfessionalAccessRepository } from './professional-access.repository';

const accessRelations = {
  producer: true,
  professional: true,
} as const;

@Injectable()
export class ProfessionalAccessTypeOrmRepository implements IProfessionalAccessRepository {
  constructor(
    @InjectRepository(ProfessionalAccess)
    private readonly repository: Repository<ProfessionalAccess>,
  ) {}

  findById(id: string): Promise<ProfessionalAccess | null> {
    return this.repository.findOne({
      where: { id },
      relations: accessRelations,
    });
  }

  findByPair(
    producerId: string,
    professionalId: string,
  ): Promise<ProfessionalAccess | null> {
    return this.repository.findOne({
      where: { producerId, professionalId },
      relations: accessRelations,
    });
  }

  findForProducer(producerId: string): Promise<ProfessionalAccess[]> {
    return this.repository.find({
      where: { producerId },
      relations: accessRelations,
      order: { updatedAt: 'DESC' },
    });
  }

  findPendingForProfessional(
    professionalId: string,
  ): Promise<ProfessionalAccess[]> {
    return this.repository.find({
      where: { professionalId, status: ProfessionalAccessStatus.PENDING },
      relations: accessRelations,
      order: { createdAt: 'DESC' },
    });
  }

  findActiveForProfessional(
    professionalId: string,
  ): Promise<ProfessionalAccess[]> {
    return this.repository.find({
      where: { professionalId, status: ProfessionalAccessStatus.ACTIVE },
      relations: accessRelations,
      order: { updatedAt: 'DESC' },
    });
  }

  findActivePair(
    producerId: string,
    professionalId: string,
  ): Promise<ProfessionalAccess | null> {
    return this.repository.findOne({
      where: {
        producerId,
        professionalId,
        status: ProfessionalAccessStatus.ACTIVE,
      },
      relations: accessRelations,
    });
  }

  create(access: Partial<ProfessionalAccess>): ProfessionalAccess {
    return this.repository.create(access);
  }

  save(access: ProfessionalAccess): Promise<ProfessionalAccess> {
    return this.repository.save(access);
  }
}
