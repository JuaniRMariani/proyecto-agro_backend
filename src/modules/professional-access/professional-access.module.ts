import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CowModule } from '../cow/cow.module';
import { UserModule } from '../user/user.module';
import { ProfessionalAccessTypeOrmRepository } from './infra/professional-access.typeorm.repository';
import { ProfessionalAccessController } from './professional-access.controller';
import { ProfessionalAccess } from './professional-access.entity';
import { ProfessionalAccessService } from './professional-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfessionalAccess]),
    UserModule,
    CowModule,
  ],
  controllers: [ProfessionalAccessController],
  providers: [
    ProfessionalAccessService,
    {
      provide: 'IProfessionalAccessRepository',
      useClass: ProfessionalAccessTypeOrmRepository,
    },
  ],
  exports: [ProfessionalAccessService],
})
export class ProfessionalAccessModule {}
