import { ProfessionalAccess } from '../professional-access.entity';

export interface IProfessionalAccessRepository {
  findById(id: string): Promise<ProfessionalAccess | null>;
  findByPair(
    producerId: string,
    professionalId: string,
  ): Promise<ProfessionalAccess | null>;
  findForProducer(producerId: string): Promise<ProfessionalAccess[]>;
  findPendingForProfessional(
    professionalId: string,
  ): Promise<ProfessionalAccess[]>;
  findActiveForProfessional(
    professionalId: string,
  ): Promise<ProfessionalAccess[]>;
  findActivePair(
    producerId: string,
    professionalId: string,
  ): Promise<ProfessionalAccess | null>;
  create(access: Partial<ProfessionalAccess>): ProfessionalAccess;
  save(access: ProfessionalAccess): Promise<ProfessionalAccess>;
}
