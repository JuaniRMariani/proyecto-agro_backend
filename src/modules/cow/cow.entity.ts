import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BodyConditionScore } from './body-condition-score.entity';
import { User } from '../user/user.entity';
import { CowOwnershipHistory } from './cow-ownership-history.entity';

@Entity('cows')
export class Cow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tagNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  syncAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @OneToMany(() => BodyConditionScore, (bcs) => bcs.cow, { cascade: true })
  bodyConditionScores: BodyConditionScore[];

  @OneToMany(() => CowOwnershipHistory, (history) => history.cow, {
    cascade: true,
  })
  ownershipHistory: CowOwnershipHistory[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
