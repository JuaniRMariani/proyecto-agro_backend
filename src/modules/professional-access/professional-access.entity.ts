import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ProfessionalAccessStatus } from './professional-access-status.enum';

@Entity('professional_access')
@Unique('UQ_professional_access_pair', ['producerId', 'professionalId'])
export class ProfessionalAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producerId' })
  producer: User;

  @Column({ type: 'uuid' })
  producerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'professionalId' })
  professional: User;

  @Column({ type: 'uuid' })
  professionalId: string;

  @Column({
    type: 'enum',
    enum: ProfessionalAccessStatus,
    enumName: 'professional_access_status_enum',
    default: ProfessionalAccessStatus.PENDING,
  })
  status: ProfessionalAccessStatus;

  @Column({ type: 'timestamptz', nullable: true })
  respondedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
