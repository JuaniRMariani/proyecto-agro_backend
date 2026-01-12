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

  @ManyToOne(() => Cow, (cow) => cow.bodyConditionScores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cowId' })
  cow: Cow;

  @Column()
  cowId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
