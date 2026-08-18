import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Cow } from '../cow/cow.entity';
import { AccountRole } from './account-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: AccountRole,
    enumName: 'user_account_role_enum',
    default: AccountRole.PRODUCER,
  })
  role: AccountRole;

  @Column({ type: 'integer', default: 0 })
  tokenVersion: number;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Cow, (cow) => cow.user)
  cows: Cow[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
