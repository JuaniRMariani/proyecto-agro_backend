import type { IncomingHttpHeaders } from 'http';
import { AccountRole } from '../../modules/user/account-role.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: AccountRole;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  headers: IncomingHttpHeaders;
}
