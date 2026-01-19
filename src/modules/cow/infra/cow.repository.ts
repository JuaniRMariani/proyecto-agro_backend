import { Cow } from '../cow.entity';
import { BodyConditionScore } from '../body-condition-score.entity';
import { CowOwnershipHistory } from '../cow-ownership-history.entity';
import { CreateCowDto } from '../dto/create-cow.dto';
import { UpdateCowDto } from '../dto/update-cow.dto';
import { CreateBodyConditionScoreDto } from '../dto/create-body-condition-score.dto';

export interface ICowRepository {
  findAll(): Promise<Cow[]>;
  findAllByUserId(userId: string): Promise<Cow[]>;
  findById(id: string): Promise<Cow | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Cow | null>;
  findByIdWithBcs(id: string): Promise<Cow | null>;
  findByTagNumber(tagNumber: string): Promise<Cow | null>;
  create(cow: CreateCowDto, userId: string): Promise<Cow>;
  update(id: string, userId: string, cow: Partial<UpdateCowDto>): Promise<Cow>;
  delete(id: string, userId: string): Promise<void>;
  transferOwnership(cowId: string, currentUserId: string, newUserId: string, reason?: string): Promise<Cow>;
  addBodyConditionScore(cowId: string, userId: string, bcs: CreateBodyConditionScoreDto): Promise<BodyConditionScore>;
  findBcsHistory(cowId: string, userId: string): Promise<BodyConditionScore[]>;
  deleteBcs(bcsId: string, userId: string): Promise<void>;
  findOwnershipHistory(cowId: string): Promise<CowOwnershipHistory[]>;
}
