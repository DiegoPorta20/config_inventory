import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { ConflictError, NotFoundError } from '../../../shared/domain/errors.js';
import { DatabaseService } from '../../../shared/infrastructure/database/database.service.js';
import { isDuplicateEntry } from '../../../shared/infrastructure/database/mysql-errors.js';
import { companies } from '../../../shared/infrastructure/database/schema.js';
import {
  CompanyRepository,
  type CompanyChanges,
  type NewCompany,
} from '../application/ports/company.repository.js';
import type { Company, CompanyStatus, CompanySummary } from '../domain/company.js';

type CompanyRow = typeof companies.$inferSelect;

const toCompany = (row: CompanyRow): Company => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  status: row.status as CompanyStatus,
  config: row.config,
  hasLogo: row.logoDataUrl !== null,
  hasFavicon: row.faviconDataUrl !== null,
  logoDataUrl: row.logoDataUrl,
  faviconDataUrl: row.faviconDataUrl,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

@Injectable()
export class DrizzleCompanyRepository extends CompanyRepository {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async findAll(): Promise<CompanySummary[]> {
    const rows = await this.database.db
      .select({
        id: companies.id,
        slug: companies.slug,
        name: companies.name,
        status: companies.status,
        config: companies.config,
        hasLogo: sql<number>`${companies.logoDataUrl} IS NOT NULL`.mapWith(Number),
        hasFavicon: sql<number>`${companies.faviconDataUrl} IS NOT NULL`.mapWith(Number),
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
      })
      .from(companies)
      .orderBy(companies.name);
    return rows.map((row) => ({
      ...row,
      status: row.status as CompanyStatus,
      hasLogo: row.hasLogo === 1,
      hasFavicon: row.hasFavicon === 1,
    }));
  }

  async findById(id: number): Promise<Company | null> {
    const [row] = await this.database.db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);
    return row ? toCompany(row) : null;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const [row] = await this.database.db
      .select()
      .from(companies)
      .where(eq(companies.slug, slug))
      .limit(1);
    return row ? toCompany(row) : null;
  }

  async create(company: NewCompany): Promise<Company> {
    try {
      const [result] = await this.database.db.insert(companies).values(company);
      return this.requireById(company.id ?? result.insertId);
    } catch (error) {
      if (isDuplicateEntry(error)) {
        throw new ConflictError('A company with this slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, changes: CompanyChanges): Promise<Company> {
    const values = Object.fromEntries(Object.entries(changes).filter(([, v]) => v !== undefined));
    if (Object.keys(values).length > 0) {
      await this.database.db.update(companies).set(values).where(eq(companies.id, id));
    }
    return this.requireById(id);
  }

  private async requireById(id: number): Promise<Company> {
    const company = await this.findById(id);
    if (!company) throw new NotFoundError('Company', id);
    return company;
  }
}
