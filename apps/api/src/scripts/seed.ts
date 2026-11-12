import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import { loadDotEnvFile, loadEnv } from '../config/env.js';
import { ScryptPasswordHasher } from '../modules/auth/infrastructure/scrypt-password-hasher.js';
import { defaultConfig } from '../modules/companies/domain/company-config.js';
import { createDatabasePool } from '../shared/infrastructure/database/database.service.js';
import * as schema from '../shared/infrastructure/database/schema.js';

/** The company that already existed before inventory became multi-company. Its id must stay 1. */
const LEGACY_COMPANY = { id: 1, slug: 'wyminer', name: 'WY Miner' } as const;

loadDotEnvFile();
const env = loadEnv();
const pool = createDatabasePool(env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: 'default' });

try {
  if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
    throw new Error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before seeding.');
  }
  const email = env.SUPER_ADMIN_EMAIL.toLowerCase();
  const [admin] = await db
    .select({ id: schema.superAdmins.id })
    .from(schema.superAdmins)
    .where(eq(schema.superAdmins.email, email))
    .limit(1);
  if (admin) {
    console.log('Super admin already exists');
  } else {
    await db.insert(schema.superAdmins).values({
      email,
      name: env.SUPER_ADMIN_NAME,
      passwordHash: await new ScryptPasswordHasher().hash(env.SUPER_ADMIN_PASSWORD),
    });
    console.log(`Super admin created: ${email}`);
  }

  const [company] = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(eq(schema.companies.id, LEGACY_COMPANY.id))
    .limit(1);
  if (company) {
    console.log(`Company ${LEGACY_COMPANY.slug} already exists`);
  } else {
    const config = defaultConfig(LEGACY_COMPANY.name);
    config.branding.appName = 'Inventario';
    config.branding.tagline = 'Almacén WY Miner';
    await db.insert(schema.companies).values({ ...LEGACY_COMPANY, config });
    console.log(`Company created: ${LEGACY_COMPANY.slug} (id ${LEGACY_COMPANY.id})`);
  }
} finally {
  await pool.end();
}
