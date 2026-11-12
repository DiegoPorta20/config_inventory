import { sql } from 'drizzle-orm';
import {
  boolean,
  datetime,
  int,
  json,
  longtext,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import type { CompanyConfig } from '../../../modules/companies/domain/company-config.js';

const createdAt = () =>
  datetime('created_at', { mode: 'date', fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`);

const updatedAt = () =>
  datetime('updated_at', { mode: 'date', fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdate(() => new Date());

/** The only people allowed to sign in to this back office. */
export const superAdmins = mysqlTable(
  'super_admins',
  {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 190 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: datetime('last_login_at', { mode: 'date', fsp: 3 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('super_admins_email_uq').on(t.email)],
);

/** A company that uses the inventory app. `id` is the `company_id` inventory stores on its rows. */
export const companies = mysqlTable(
  'companies',
  {
    id: int('id').autoincrement().primaryKey(),
    slug: varchar('slug', { length: 60 }).notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
    config: json('config').$type<CompanyConfig>().notNull(),
    logoDataUrl: longtext('logo_data_url'),
    faviconDataUrl: longtext('favicon_data_url'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('companies_slug_uq').on(t.slug)],
);
