export class CowOwnershipHistoryResponseDto {
  id: string;
  cowId: string;
  previousUserId: string | null;
  newUserId: string;
  reason: string | null;
  transferredAt: Date;

  constructor(partial: Partial<CowOwnershipHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
