import { Injectable } from '@nestjs/common';
import type { AuthenticatedAdmin } from '../../../../shared/domain/auth.js';
import {
  BusinessRuleError,
  NotFoundError,
  UnauthorizedError,
} from '../../../../shared/domain/errors.js';
import {
  normalizeEmail,
  toPublicAdmin,
  type PublicSuperAdmin,
  type SuperAdmin,
} from '../../domain/super-admin.js';
import { AdminRepository } from '../ports/admin.repository.js';
import { PasswordHasher } from '../ports/password-hasher.js';
import { TokenService, type TokenPair } from '../ports/token.service.js';

export interface Session {
  admin: PublicSuperAdmin;
  tokens: TokenPair;
}

const toAuthenticated = (admin: SuperAdmin): AuthenticatedAdmin => ({
  id: admin.id,
  email: admin.email,
  name: admin.name,
});

@Injectable()
export class Login {
  constructor(
    private readonly admins: AdminRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: { email: string; password: string }): Promise<Session> {
    const admin = await this.admins.findByEmail(normalizeEmail(input.email));
    if (!admin) {
      await this.hasher.hash(input.password);
      throw new UnauthorizedError('Invalid email or password');
    }
    const valid = await this.hasher.verify(input.password, admin.passwordHash);
    if (!valid || !admin.isActive) throw new UnauthorizedError('Invalid email or password');

    await this.admins.recordLogin(admin.id, new Date());
    return {
      admin: toPublicAdmin(admin),
      tokens: await this.tokens.issue(toAuthenticated(admin)),
    };
  }
}

@Injectable()
export class RefreshSession {
  constructor(
    private readonly admins: AdminRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(refreshToken: string | undefined): Promise<Session> {
    const id = refreshToken ? await this.tokens.verifyRefresh(refreshToken) : null;
    const admin = id ? await this.admins.findById(id) : null;
    if (!admin || !admin.isActive) throw new UnauthorizedError('Session expired');
    return {
      admin: toPublicAdmin(admin),
      tokens: await this.tokens.issue(toAuthenticated(admin)),
    };
  }
}

@Injectable()
export class GetCurrentAdmin {
  constructor(private readonly admins: AdminRepository) {}

  async execute(id: number): Promise<PublicSuperAdmin> {
    const admin = await this.admins.findById(id);
    if (!admin || !admin.isActive) throw new UnauthorizedError('Session expired');
    return toPublicAdmin(admin);
  }
}

@Injectable()
export class ChangePassword {
  constructor(
    private readonly admins: AdminRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(
    id: number,
    input: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    const admin = await this.admins.findById(id);
    if (!admin) throw new NotFoundError('Administrator', id);
    if (!(await this.hasher.verify(input.currentPassword, admin.passwordHash))) {
      throw new BusinessRuleError('INVALID_CURRENT_PASSWORD', 'Current password is incorrect');
    }
    await this.admins.updatePassword(id, await this.hasher.hash(input.newPassword));
  }
}
