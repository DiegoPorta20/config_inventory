import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../../shared/infrastructure/database/database.service.js';
import { superAdmins } from '../../../shared/infrastructure/database/schema.js';
import { AdminRepository } from '../application/ports/admin.repository.js';
import type { SuperAdmin } from '../domain/super-admin.js';

@Injectable()
export class DrizzleAdminRepository extends AdminRepository {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async findById(id: number): Promise<SuperAdmin | null> {
    const [row] = await this.database.db
      .select()
      .from(superAdmins)
      .where(eq(superAdmins.id, id))
      .limit(1);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    const [row] = await this.database.db
      .select()
      .from(superAdmins)
      .where(eq(superAdmins.email, email))
      .limit(1);
    return row ?? null;
  }

  async recordLogin(id: number, at: Date): Promise<void> {
    await this.database.db
      .update(superAdmins)
      .set({ lastLoginAt: at })
      .where(eq(superAdmins.id, id));
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.database.db.update(superAdmins).set({ passwordHash }).where(eq(superAdmins.id, id));
  }
}
