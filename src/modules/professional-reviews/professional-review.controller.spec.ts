import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-request.interface';
import { AccountRole } from '../user/account-role.enum';
import { ProfessionalReviewController } from './professional-review.controller';
import { ProfessionalReviewService } from './professional-review.service';

type ControllerService = Pick<
  ProfessionalReviewService,
  'createReview' | 'listReviews' | 'updateReview' | 'applySuggestedScore'
>;

describe('ProfessionalReviewController', () => {
  let controller: ProfessionalReviewController;
  let service: jest.Mocked<ControllerService>;

  const request: AuthenticatedRequest = {
    user: {
      userId: '11111111-1111-4111-8111-111111111111',
      email: 'producer@example.com',
      role: AccountRole.PRODUCER,
    },
    headers: {},
  };

  beforeEach(async () => {
    service = {
      createReview: jest.fn(),
      listReviews: jest.fn(),
      updateReview: jest.fn(),
      applySuggestedScore: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalReviewController],
      providers: [{ provide: ProfessionalReviewService, useValue: service }],
    }).compile();
    controller = module.get<ProfessionalReviewController>(
      ProfessionalReviewController,
    );
  });

  it('passes the actor and optional filters to list', async () => {
    const query = { scoreId: '22222222-2222-4222-8222-222222222222' };

    await controller.listReviews(request, query);

    expect(service.listReviews).toHaveBeenCalledWith(request.user, query);
  });

  it('passes the producer actor when applying a suggestion', async () => {
    const reviewId = '33333333-3333-4333-8333-333333333333';

    await controller.applySuggestedScore(reviewId, request);

    expect(service.applySuggestedScore).toHaveBeenCalledWith(
      request.user,
      reviewId,
    );
  });
});
