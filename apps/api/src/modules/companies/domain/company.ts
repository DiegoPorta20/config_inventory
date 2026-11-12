import type { CompanyConfig } from './company-config.js';
import type { Palette } from './palette.js';

export const COMPANY_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export interface CompanySummary {
  id: number;
  slug: string;
  name: string;
  status: CompanyStatus;
  config: CompanyConfig;
  hasLogo: boolean;
  hasFavicon: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company extends CompanySummary {
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
}

/** Top-level web routes that a company slug must never shadow. */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'api',
  'admin',
  'login',
  'logout',
  'assets',
  'public',
  'static',
  'health',
]);

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,58})[a-z0-9]$/;

export const normalizeSlug = (slug: string): string => slug.trim().toLowerCase();

/** The shape inventory consumes: permissions already resolved, images inlined. */
export interface CompanyProfile {
  id: number;
  slug: string;
  name: string;
  status: CompanyStatus;
  config: {
    branding: CompanyConfig['branding'] & {
      logoUrl: string | null;
      faviconUrl: string | null;
      /** Ready-made color scales so every client paints exactly the same shades. */
      palette: { primary: Palette; accent: Palette };
    };
    modules: string[];
    permissions: { PERSONAL: string[] };
    limits: CompanyConfig['limits'];
  };
}
