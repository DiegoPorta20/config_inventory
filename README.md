# config_inventory

Back office interno para configurar las empresas que usan la aplicación de inventario (`../inventory`
web y `../inventory_mobile`). Solo el super administrador puede iniciar sesión aquí.

Por empresa se define: nombre, logo y colores, módulos activos, permisos del personal, límite de
usuarios, y se crea su primer administrador en inventory.

Monolito: API NestJS + web Angular en un solo despliegue, con su propia base de datos MySQL
(`config_inventory`), separada de la de inventory.

## Primeros pasos

```
pnpm install
cp .env.example .env     # completa DATABASE_URL, claves y SUPER_ADMIN_*
pnpm db:migrate
pnpm db:seed             # super admin + la empresa 'wyminer' (id 1)
pnpm dev                 # api :3100 + web :4200
```

En PowerShell usa `pnpm.cmd` si la ejecución de scripts está bloqueada.

## Cómo se conecta con inventory

- inventory pide la configuración de cada empresa a `GET /api/service/companies/by-slug/:slug`
  (cabecera `x-service-key` = `SERVICE_API_KEY`, que en inventory es `CONFIG_SERVICE_KEY`).
- Este proyecto crea el primer administrador de una empresa llamando a
  `POST {INVENTORY_URL}/api/internal/companies/:id/admins`
  (cabecera `x-service-key` = `INVENTORY_INTERNAL_KEY`, que en inventory es `INTERNAL_API_KEY`).
- El `id` de cada empresa aquí es el `company_id` que inventory guarda en sus tablas. La empresa que
  ya existía antes del multi-empresa debe seguir siendo la de id 1 (`pnpm db:seed` la crea).
