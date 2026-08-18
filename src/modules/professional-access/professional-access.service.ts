import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-request.interface';
import { CowResponseDto } from '../cow/dto/cow-response.dto';
import { CowService } from '../cow/cow.service';
import {
  AccountRole,
  isProfessionalAccountRole,
} from '../user/account-role.enum';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ProfessionalAccessResponseDto } from './dto/professional-access-response.dto';
import { ProfessionalClientResponseDto } from './dto/professional-client-response.dto';
import { RequestProfessionalAccessDto } from './dto/request-professional-access.dto';
import type { IProfessionalAccessRepository } from './infra/professional-access.repository';
import { ProfessionalAccessStatus } from './professional-access-status.enum';
import { ProfessionalAccess } from './professional-access.entity';

@Injectable()
export class ProfessionalAccessService {
  constructor(
    @Inject('IProfessionalAccessRepository')
    private readonly accessRepository: IProfessionalAccessRepository,
    private readonly userService: UserService,
    private readonly cowService: CowService,
  ) {}

  async requestAccess(
    actor: AuthenticatedUser,
    requestDto: RequestProfessionalAccessDto,
  ): Promise<ProfessionalAccessResponseDto> {
    this.assertProducer(actor);

    const [producer, professional] = await Promise.all([
      this.userService.getUserById(actor.userId),
      this.userService.getUserByEmail(requestDto.professionalEmail),
    ]);
    if (!producer) {
      throw new NotFoundException('Productor no encontrado');
    }
    if (!professional || !isProfessionalAccountRole(professional.role)) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const existing = await this.accessRepository.findByPair(
      producer.id,
      professional.id,
    );
    if (
      existing?.status === ProfessionalAccessStatus.PENDING ||
      existing?.status === ProfessionalAccessStatus.ACTIVE
    ) {
      throw new ConflictException('El vínculo profesional ya existe');
    }

    const access =
      existing ??
      this.accessRepository.create({
        producerId: producer.id,
        professionalId: professional.id,
      });
    access.status = ProfessionalAccessStatus.PENDING;
    access.respondedAt = null;
    access.revokedAt = null;

    try {
      const savedAccess = await this.accessRepository.save(access);
      return this.mapAccess(savedAccess, producer, professional);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('El vínculo profesional ya existe');
      }
      throw error;
    }
  }

  async listProducerAccess(
    actor: AuthenticatedUser,
  ): Promise<ProfessionalAccessResponseDto[]> {
    this.assertProducer(actor);
    const accesses = await this.accessRepository.findForProducer(actor.userId);
    return accesses.map((access) => this.mapLoadedAccess(access));
  }

  async listPendingRequests(
    actor: AuthenticatedUser,
  ): Promise<ProfessionalAccessResponseDto[]> {
    this.assertProfessional(actor);
    const accesses = await this.accessRepository.findPendingForProfessional(
      actor.userId,
    );
    return accesses.map((access) => this.mapLoadedAccess(access));
  }

  acceptRequest(
    actor: AuthenticatedUser,
    accessId: string,
  ): Promise<ProfessionalAccessResponseDto> {
    return this.respondToRequest(
      actor,
      accessId,
      ProfessionalAccessStatus.ACTIVE,
    );
  }

  rejectRequest(
    actor: AuthenticatedUser,
    accessId: string,
  ): Promise<ProfessionalAccessResponseDto> {
    return this.respondToRequest(
      actor,
      accessId,
      ProfessionalAccessStatus.REJECTED,
    );
  }

  async revokeAccess(
    actor: AuthenticatedUser,
    accessId: string,
  ): Promise<void> {
    this.assertProducer(actor);
    const access = await this.accessRepository.findById(accessId);
    if (!access || access.producerId !== actor.userId) {
      throw new NotFoundException('Vínculo profesional no encontrado');
    }
    access.status = ProfessionalAccessStatus.REVOKED;
    access.revokedAt = new Date();
    await this.accessRepository.save(access);
  }

  async listClients(
    actor: AuthenticatedUser,
  ): Promise<ProfessionalClientResponseDto[]> {
    this.assertProfessional(actor);
    const accesses = await this.accessRepository.findActiveForProfessional(
      actor.userId,
    );
    return accesses.map(
      (access) =>
        new ProfessionalClientResponseDto({
          id: access.producer.id,
          fullName: access.producer.fullName,
          email: access.producer.email,
          role: access.producer.role,
          accessId: access.id,
        }),
    );
  }

  async getClientCows(
    actor: AuthenticatedUser,
    producerId: string,
  ): Promise<CowResponseDto[]> {
    await this.assertActiveClientAccess(actor, producerId);
    return this.cowService.getCowsByUserId(producerId);
  }

  async assertActiveClientAccess(
    actor: AuthenticatedUser,
    producerId: string,
  ): Promise<void> {
    this.assertProfessional(actor);
    const access = await this.accessRepository.findActivePair(
      producerId,
      actor.userId,
    );
    if (!access) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  private async respondToRequest(
    actor: AuthenticatedUser,
    accessId: string,
    status: ProfessionalAccessStatus.ACTIVE | ProfessionalAccessStatus.REJECTED,
  ): Promise<ProfessionalAccessResponseDto> {
    this.assertProfessional(actor);
    const access = await this.accessRepository.findById(accessId);
    if (!access || access.professionalId !== actor.userId) {
      throw new NotFoundException('Solicitud profesional no encontrada');
    }
    if (access.status !== ProfessionalAccessStatus.PENDING) {
      throw new ConflictException('La solicitud profesional ya fue respondida');
    }
    access.status = status;
    access.respondedAt = new Date();
    const savedAccess = await this.accessRepository.save(access);
    return this.mapLoadedAccess(savedAccess);
  }

  private assertProducer(actor: AuthenticatedUser): void {
    if (actor.role !== AccountRole.PRODUCER) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta productora',
      );
    }
  }

  private assertProfessional(actor: AuthenticatedUser): void {
    if (!isProfessionalAccountRole(actor.role)) {
      throw new ForbiddenException(
        'Esta acción requiere una cuenta veterinaria o profesional',
      );
    }
  }

  private mapLoadedAccess(
    access: ProfessionalAccess,
  ): ProfessionalAccessResponseDto {
    return this.mapAccess(
      access,
      this.mapUser(access.producer),
      this.mapUser(access.professional),
    );
  }

  private mapAccess(
    access: ProfessionalAccess,
    producer: UserResponseDto,
    professional: UserResponseDto,
  ): ProfessionalAccessResponseDto {
    return new ProfessionalAccessResponseDto({
      id: access.id,
      status: access.status,
      producer,
      professional,
      createdAt: access.createdAt,
      updatedAt: access.updatedAt,
    });
  }

  private mapUser(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
