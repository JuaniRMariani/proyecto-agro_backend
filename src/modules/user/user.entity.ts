import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cow } from '../cow/cow.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Cow, (cow) => cow.user)
  cows: Cow[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true, select: false })
  resetPasswordToken: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true, select: false })
  resetPasswordExpires: Date;
}
