import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cow } from './cow.entity';

@Entity('body_condition_scores')
export class BodyConditionScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  score: number;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @Column({ type: 'text', nullable: true })
  observation: string;

  @ManyToOne(() => Cow, (cow) => cow.bodyConditionScores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cowId' })
  cow: Cow;

  @Column()
  cowId: string;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  syncAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  imagePublicId: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  clientId: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
