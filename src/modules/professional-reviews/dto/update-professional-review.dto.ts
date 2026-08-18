import { PartialType, PickType } from '@nestjs/swagger';
import { CreateProfessionalReviewDto } from './create-professional-review.dto';

export class UpdateProfessionalReviewDto extends PartialType(
  PickType(CreateProfessionalReviewDto, [
    'title',
    'assessment',
    'recommendations',
    'suggestedScore',
    'referenceLinks',
    'exampleImageUrls',
    'status',
  ] as const),
) {}
