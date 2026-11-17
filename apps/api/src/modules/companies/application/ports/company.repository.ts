import type { Company, CompanyStatus, CompanySummary } from '../../domain/company.js';
import type { CompanyConfig } from '../../domain/company-config.js';

export interface NewCompany {
  id?: number;
  slug: string;
  name: string;
  config: CompanyConfig;
}

export interface CompanyChanges {
  name?: string;
  status?: CompanyStatus;
  config?: CompanyConfig;
  logoDataUrl?: string | null;
  faviconDataUrl?: string | null;
}

export abstract class CompanyRepository {
  abstract findAll(): Promise<CompanySummary[]>;
  abstract findById(id: number): Promise<Company | null>;
  abstract findBySlug(slug: string): Promise<Company | null>;
  abstract create(company: NewCompany): Promise<Company>;
  abstract update(id: number, changes: CompanyChanges): Promise<Company>;
}
