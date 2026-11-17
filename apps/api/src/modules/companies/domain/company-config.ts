import { GRANTABLE_PERMISSIONS, MODULE_KEYS } from '../../catalog/domain/catalog.js';

export interface CompanyBranding {
  appName: string;
  tagline: string | null;
  primaryColor: string;
  accentColor: string | null;
}

/** What this back office decides for a company; inventory only reads it. */
export interface CompanyConfig {
  branding: CompanyBranding;
  modules: string[];
  permissions: { PERSONAL: string[] };
  limits: { maxUsers: number | null };
}

const HIDDEN_BY_DEFAULT = new Set(['products.costs.view', 'products.prices.view']);

/** A new company starts with every module, read-only access for staff and no user limit. */
export function defaultConfig(name: string): CompanyConfig {
  return {
    branding: {
      appName: name,
      tagline: null,
      primaryColor: '#273f85',
      accentColor: '#01abce',
    },
    modules: [...MODULE_KEYS],
    permissions: {
      PERSONAL: GRANTABLE_PERMISSIONS.filter(
        (code) => code.endsWith('.view') && !HIDDEN_BY_DEFAULT.has(code),
      ),
    },
    limits: { maxUsers: null },
  };
}
