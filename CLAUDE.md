# config_inventory

Internal back office for the super administrator: configures every company that uses the inventory app (`../inventory` web + API, `../inventory_mobile` Flutter). Monolith like inventory: NestJS API + Angular SPA served as one deployable, with its own MySQL database. Nothing about company configuration belongs in the inventory repo; inventory only reads it.

## Layout

```
apps/api   NestJS 12 (ESM) + Drizzle ORM + MySQL, clean architecture (same conventions as inventory)
apps/web   Angular 22 (standalone, signals) + Tailwind 4, same design system as inventory web
```

## Commands (pnpm workspace, run from repo root)

```
pnpm install
pnpm db:migrate | db:seed | db:generate
pnpm dev                 # api :3100 + web :4200 (proxy /api)
pnpm lint | typecheck | build
```

On Windows PowerShell use `pnpm.cmd` if script execution is blocked.

## Rules

- Code, identifiers, commits and API fields in English; UI text in Spanish (Peru).
- Only the super administrator signs in (`super_admins`). Cookies are named `config_*` so they never collide with inventory's on localhost.
- A company's `id` is the `company_id` inventory stores; never reuse or renumber ids.
- `modules/catalog/domain/catalog.ts` is the source of truth for modules and permission codes. Inventory must enforce exactly these codes; adding one means changing inventory too. Admin-only modules can never be granted to PERSONAL.
- `config` JSON on `companies` is validated by `companyConfigSchema`; PERSONAL permissions of disabled modules are kept in the editor but dropped from the profile served to inventory (`effectivePersonalPermissions`).
- The service API (`/api/service/*`) is server-to-server (shared key). Keep it read-only.
- Logos and favicons are stored as PNG/JPEG/WebP data URLs (max ~300 KB) and served inline in the profile.
- Never commit `.env`. Shared keys must match inventory's `.env` (see README).
