export interface ModuleDefinition {
  /** Matches the inventory feature and the prefix of its permission codes. */
  key: string;
  /** Administrator-only modules cannot be granted to the PERSONAL role. */
  adminOnly: boolean;
  /** Full permission codes, `<module>.<action>`. The first one is always `<module>.view`. */
  permissions: readonly string[];
}

export const MODULES: readonly ModuleDefinition[] = [
  { key: 'dashboard', adminOnly: false, permissions: ['dashboard.view'] },
  {
    key: 'products',
    adminOnly: false,
    permissions: [
      'products.view',
      'products.create',
      'products.update',
      'products.delete',
      'products.export',
      'products.import',
      'products.costs.view',
      'products.prices.view',
    ],
  },
  { key: 'categories', adminOnly: false, permissions: ['categories.view', 'categories.manage'] },
  {
    key: 'cost-centers',
    adminOnly: false,
    permissions: ['cost-centers.view', 'cost-centers.manage'],
  },
  { key: 'movements', adminOnly: false, permissions: ['movements.view', 'movements.create'] },
  {
    key: 'counts',
    adminOnly: false,
    permissions: ['counts.view', 'counts.create', 'counts.record', 'counts.complete'],
  },
  { key: 'reorder', adminOnly: false, permissions: ['reorder.view'] },
  {
    key: 'imports',
    adminOnly: false,
    permissions: [
      'imports.view',
      'imports.create',
      'imports.update',
      'imports.receive',
      'imports.delete',
    ],
  },
  { key: 'suppliers', adminOnly: false, permissions: ['suppliers.view', 'suppliers.manage'] },
  { key: 'equipment', adminOnly: false, permissions: ['equipment.view', 'equipment.manage'] },
  { key: 'users', adminOnly: true, permissions: [] },
  { key: 'settings', adminOnly: true, permissions: [] },
];

export const MODULE_KEYS: readonly string[] = MODULES.map((module) => module.key);

export const GRANTABLE_PERMISSIONS: readonly string[] = MODULES.filter(
  (module) => !module.adminOnly,
).flatMap((module) => module.permissions);

const moduleOfPermission = (code: string): string => code.split('.')[0] ?? '';

/**
 * Permissions that PERSONAL users actually get: only from enabled modules, and every module
 * with any permission also grants its `view`.
 */
export function effectivePersonalPermissions(
  enabledModules: readonly string[],
  granted: readonly string[],
): string[] {
  const enabled = new Set(enabledModules);
  const result = new Set<string>();
  for (const code of granted) {
    const moduleKey = moduleOfPermission(code);
    if (!enabled.has(moduleKey) || !GRANTABLE_PERMISSIONS.includes(code)) continue;
    result.add(code);
    result.add(`${moduleKey}.view`);
  }
  return [...result].sort();
}
