import { Injectable } from '@nestjs/common';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors.js';
import type {
  Company,
  CompanyProfile,
  CompanyStatus,
  CompanySummary,
} from '../../domain/company.js';
import { normalizeSlug } from '../../domain/company.js';
import { defaultConfig, type CompanyConfig } from '../../domain/company-config.js';
import { accentPalette, primaryPalette } from '../../domain/palette.js';
import { effectivePersonalPermissions } from '../../../catalog/domain/catalog.js';
import { CompanyRepository } from '../ports/company.repository.js';
import { InventoryLink, type ProvisionedAdmin } from '../ports/inventory-link.js';

async function requireCompany(companies: CompanyRepository, id: number): Promise<Company> {
  const company = await companies.findById(id);
  if (!company) throw new NotFoundError('Company', id);
  return company;
}

export function toProfile(company: Company): CompanyProfile {
  const { config } = company;
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    status: company.status,
    config: {
      branding: {
        appName: config.branding.appName,
        tagline: config.branding.tagline,
        primaryColor: config.branding.primaryColor,
        accentColor: config.branding.accentColor,
        logoUrl: company.logoDataUrl,
        faviconUrl: company.faviconDataUrl,
        palette: {
          primary: primaryPalette(config.branding.primaryColor),
          accent: accentPalette(config.branding.accentColor ?? config.branding.primaryColor),
        },
      },
      modules: config.modules,
      permissions: {
        PERSONAL: effectivePersonalPermissions(config.modules, config.permissions.PERSONAL),
      },
      limits: config.limits,
    },
  };
}

@Injectable()
export class ListCompanies {
  constructor(private readonly companies: CompanyRepository) {}

  execute(): Promise<CompanySummary[]> {
    return this.companies.findAll();
  }
}

@Injectable()
export class GetCompany {
  constructor(private readonly companies: CompanyRepository) {}

  execute(id: number): Promise<Company> {
    return requireCompany(this.companies, id);
  }
}

@Injectable()
export class CreateCompany {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(input: { slug: string; name: string }): Promise<Company> {
    const slug = normalizeSlug(input.slug);
    if (await this.companies.findBySlug(slug)) {
      throw new ConflictError('A company with this slug already exists');
    }
    const name = input.name.trim();
    return this.companies.create({ slug, name, config: defaultConfig(name) });
  }
}

@Injectable()
export class UpdateCompany {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(id: number, input: { name?: string; status?: CompanyStatus }): Promise<Company> {
    await requireCompany(this.companies, id);
    return this.companies.update(id, { name: input.name?.trim(), status: input.status });
  }
}

@Injectable()
export class UpdateCompanyConfig {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(id: number, config: CompanyConfig): Promise<Company> {
    await requireCompany(this.companies, id);
    return this.companies.update(id, { config });
  }
}

@Injectable()
export class SetCompanyImage {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(id: number, kind: 'logo' | 'favicon', dataUrl: string | null): Promise<Company> {
    await requireCompany(this.companies, id);
    return this.companies.update(
      id,
      kind === 'logo' ? { logoDataUrl: dataUrl } : { faviconDataUrl: dataUrl },
    );
  }
}

@Injectable()
export class ProvisionCompanyAdmin {
  constructor(
    private readonly companies: CompanyRepository,
    private readonly inventory: InventoryLink,
  ) {}

  async execute(
    id: number,
    input: { email: string; name: string; password: string },
  ): Promise<ProvisionedAdmin> {
    await requireCompany(this.companies, id);
    return this.inventory.createAdmin(id, input);
  }
}

@Injectable()
export class GetCompanyProfile {
  constructor(private readonly companies: CompanyRepository) {}

  async bySlug(slug: string): Promise<CompanyProfile> {
    const company = await this.companies.findBySlug(normalizeSlug(slug));
    if (!company) throw new NotFoundError('Company', slug);
    return toProfile(company);
  }

  async byId(id: number): Promise<CompanyProfile> {
    return toProfile(await requireCompany(this.companies, id));
  }
}
