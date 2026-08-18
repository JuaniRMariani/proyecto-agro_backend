import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyConditionScore } from '../cow/body-condition-score.entity';
import { ProfessionalAccessModule } from '../professional-access/professional-access.module';
import { ProfessionalReviewTypeOrmRepository } from './infra/professional-review.typeorm.repository';
import { ProfessionalReviewController } from './professional-review.controller';
import { ProfessionalReview } from './professional-review.entity';
import { ProfessionalReviewService } from './professional-review.service';
import { CowModule } from '../cow/cow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfessionalReview, BodyConditionScore]),
    ProfessionalAccessModule,
    CowModule,
  ],
  controllers: [ProfessionalReviewController],
  providers: [
    ProfessionalReviewService,
    {
      provide: 'IProfessionalReviewRepository',
      useClass: ProfessionalReviewTypeOrmRepository,
    },
  ],
})
export class ProfessionalReviewModule {}
