import type { SuperAdmin } from '../../domain/super-admin.js';

export abstract class AdminRepository {
  abstract findById(id: number): Promise<SuperAdmin | null>;
  abstract findByEmail(email: string): Promise<SuperAdmin | null>;
  abstract recordLogin(id: number, at: Date): Promise<void>;
  abstract updatePassword(id: number, passwordHash: string): Promise<void>;
}
