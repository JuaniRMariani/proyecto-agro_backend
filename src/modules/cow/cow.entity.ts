import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BodyConditionScore } from './body-condition-score.entity';

@Entity('cows')
export class Cow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tagNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @OneToMany(() => BodyConditionScore, (bcs) => bcs.cow, { cascade: true })
  bodyConditionScores: BodyConditionScore[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
