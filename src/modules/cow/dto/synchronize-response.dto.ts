import { ApiProperty } from '@nestjs/swagger';
import { CowResponseDto } from './cow-response.dto';

class SynchronizeCountsDto {
  @ApiProperty({ example: 1 })
  created: number;

  @ApiProperty({ example: 1 })
  updated: number;

  @ApiProperty({ example: 0 })
  deleted: number;

  @ApiProperty({ example: 0 })
  skipped: number;
}

export class SynchronizeResponseDto {
  @ApiProperty({ type: SynchronizeCountsDto })
  cows: SynchronizeCountsDto;

  @ApiProperty({ type: SynchronizeCountsDto })
  scores: SynchronizeCountsDto;

  @ApiProperty({ type: CowResponseDto, isArray: true })
  data: CowResponseDto[];
}