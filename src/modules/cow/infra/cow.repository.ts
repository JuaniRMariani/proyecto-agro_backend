import { Cow } from '../cow.entity';
import { BodyConditionScore } from '../body-condition-score.entity';
import { CreateCowDto } from '../dto/create-cow.dto';
import { UpdateCowDto } from '../dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from '../dto/create-body-condition-score.dto';

export interface ICowRepository {
  findAll(): Promise<Cow[]>;
  findById(id: string): Promise<Cow | null>;
  findByIdWithBcs(id: string): Promise<Cow | null>;
  findByTagNumber(tagNumber: string): Promise<Cow | null>;
  create(cow: CreateCowDto): Promise<Cow>;
  update(id: string, cow: Partial<UpdateCowDto>): Promise<Cow>;
  delete(id: string): Promise<void>;
  addBodyConditionScore(cowId: string, bcs: CreateBodyConditionScoreDto): Promise<BodyConditionScore>;
  findBcsHistory(cowId: string): Promise<BodyConditionScore[]>;
  deleteBcs(bcsId: string): Promise<void>;
}
