import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cow } from './cow.entity';
import { ScoreSource } from './score-source.enum';

@Entity('body_condition_scores')
export class BodyConditionScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  score: string;

  @Column({ type: 'varchar', length: 10, update: false })
  modelScore: string;

  @Column({
    type: 'enum',
    enum: ScoreSource,
    enumName: 'body_condition_score_source_enum',
    default: ScoreSource.MODEL,
  })
  scoreSource: ScoreSource;

  @Column({ type: 'text', nullable: true })
  overrideReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  overriddenAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  overriddenByUserId: string | null;

  @Column({ type: 'uuid', nullable: true })
  appliedReviewId: string | null;

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
