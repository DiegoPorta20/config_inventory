import type { AuthenticatedAdmin } from '../../../../shared/domain/auth.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export abstract class TokenService {
  abstract issue(admin: AuthenticatedAdmin): Promise<TokenPair>;
  abstract verifyAccess(token: string): Promise<AuthenticatedAdmin | null>;
  abstract verifyRefresh(token: string): Promise<number | null>;
}
