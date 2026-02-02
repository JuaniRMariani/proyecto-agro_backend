import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cow } from './cow.entity';
import { BodyConditionScore } from './body-condition-score.entity';
import { CowOwnershipHistory } from './cow-ownership-history.entity';
import { CowController } from './cow.controller';
import { CowService } from './cow.service';
import { CowTypeOrmRepository } from './infra/cow.typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cow, BodyConditionScore, CowOwnershipHistory]),
  ],
  controllers: [CowController],
  providers: [
    CowService,
    {
      provide: 'ICowRepository',
      useClass: CowTypeOrmRepository,
    },
  ],
  exports: [CowService],
})
export class CowModule {}
