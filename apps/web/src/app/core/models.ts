export interface Admin {
  id: number;
  email: string;
  name: string;
}

export type CompanyStatus = 'ACTIVE' | 'SUSPENDED';

export interface CompanyBranding {
  appName: string;
  tagline: string | null;
  primaryColor: string;
  accentColor: string | null;
}

export interface CompanyConfig {
  branding: CompanyBranding;
  modules: string[];
  permissions: { PERSONAL: string[] };
  limits: { maxUsers: number | null };
}

export interface CompanySummary {
  id: number;
  slug: string;
  name: string;
  status: CompanyStatus;
  config: CompanyConfig;
  hasLogo: boolean;
  hasFavicon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company extends CompanySummary {
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
}

export interface CatalogModule {
  key: string;
  adminOnly: boolean;
  permissions: string[];
}

export interface ProvisionedAdmin {
  id: number;
  email: string;
  name: string;
}
