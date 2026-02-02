import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { BodyConditionScore } from '../cow/body-condition-score.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([BodyConditionScore])],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
