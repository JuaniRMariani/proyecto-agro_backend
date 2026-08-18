import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BodyConditionScore } from '../cow/body-condition-score.entity';
import { Cow } from '../cow/cow.entity';
import { User } from '../user/user.entity';
import { ProfessionalReviewStatus } from './professional-review-status.enum';
import type { BcsScore } from '../cow/bcs-score.constants';

@Entity('professional_reviews')
export class ProfessionalReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'producerId' })
  producer: User;

  @Column({ type: 'uuid' })
  producerId: string;

  @ManyToOne(() => Cow, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cowId' })
  cow: Cow;

  @Column({ type: 'uuid' })
  cowId: string;

  @ManyToOne(() => BodyConditionScore, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'scoreId' })
  score: BodyConditionScore;

  @Column({ type: 'uuid' })
  scoreId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorProfessionalId' })
  author: User;

  @Column({ type: 'uuid' })
  authorProfessionalId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  assessment: string;

  @Column({ type: 'text' })
  recommendations: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  suggestedScore: BcsScore | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  referenceLinks: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  exampleImageUrls: string[];

  @Column({
    type: 'enum',
    enum: ProfessionalReviewStatus,
    enumName: 'professional_review_status_enum',
    default: ProfessionalReviewStatus.DRAFT,
  })
  status: ProfessionalReviewStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
