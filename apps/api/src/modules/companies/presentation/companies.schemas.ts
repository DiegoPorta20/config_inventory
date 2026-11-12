import { z } from 'zod';
import { GRANTABLE_PERMISSIONS, MODULE_KEYS } from '../../catalog/domain/catalog.js';
import { COMPANY_STATUSES, RESERVED_SLUGS, SLUG_PATTERN } from '../domain/company.js';

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a #RRGGBB color');

const unique = (values: string[]) => new Set(values).size === values.length;

export const createCompanySchema = z.strictObject({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_PATTERN, 'Use 3-60 lowercase letters, digits or hyphens')
    .refine((value) => !RESERVED_SLUGS.has(value), 'This slug is reserved'),
  name: z.string().trim().min(1).max(160),
});

export const updateCompanySchema = z.strictObject({
  name: z.string().trim().min(1).max(160).optional(),
  status: z.enum(COMPANY_STATUSES).optional(),
});

export const companyConfigSchema = z.strictObject({
  branding: z.strictObject({
    appName: z.string().trim().min(1).max(60),
    tagline: z
      .string()
      .trim()
      .max(120)
      .transform((value) => (value === '' ? null : value))
      .nullable(),
    primaryColor: color,
    accentColor: color.nullable(),
  }),
  modules: z
    .array(z.enum(MODULE_KEYS as [string, ...string[]]))
    .refine(unique, 'Duplicated modules'),
  permissions: z.strictObject({
    PERSONAL: z
      .array(z.enum(GRANTABLE_PERMISSIONS as [string, ...string[]]))
      .refine(unique, 'Duplicated permissions'),
  }),
  limits: z.strictObject({ maxUsers: z.number().int().min(1).max(100_000).nullable() }),
});

const MAX_IMAGE_CHARS = 400_000;

export const setImageSchema = z.strictObject({
  dataUrl: z
    .string()
    .max(MAX_IMAGE_CHARS, 'The image is too large (300 KB maximum)')
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/, 'Use a PNG, JPEG or WebP')
    .nullable(),
});

export const provisionAdminSchema = z.strictObject({
  email: z.string().trim().email().max(190),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
});

export type CreateCompanyBody = z.infer<typeof createCompanySchema>;
export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;
export type CompanyConfigBody = z.infer<typeof companyConfigSchema>;
export type SetImageBody = z.infer<typeof setImageSchema>;
export type ProvisionAdminBody = z.infer<typeof provisionAdminSchema>;
