import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cow } from './cow.entity';
import { User } from '../user/user.entity';

@Entity('cow_ownership_history')
export class CowOwnershipHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cow, (cow) => cow.ownershipHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cowId' })
  cow: Cow;

  @Column()
  cowId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'previousUserId' })
  previousUser: User;

  @Column({ nullable: true })
  previousUserId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'newUserId' })
  newUser: User;

  @Column()
  newUserId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ type: 'timestamp' })
  transferredAt: Date;
}
