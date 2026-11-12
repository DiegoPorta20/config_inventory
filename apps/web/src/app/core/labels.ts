export const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Panel',
  products: 'Productos',
  categories: 'Categorías',
  'cost-centers': 'Centros de costo',
  movements: 'Movimientos',
  counts: 'Conteos físicos',
  reorder: 'Reposición',
  imports: 'Importaciones',
  suppliers: 'Proveedores',
  equipment: 'Equipos',
  users: 'Usuarios',
  settings: 'Configuración',
};

export const MODULE_DESCRIPTIONS: Record<string, string> = {
  dashboard: 'Resumen del inventario y movimientos recientes',
  products: 'Catálogo, stock, costos y precios',
  categories: 'Clasificación de productos',
  'cost-centers': 'Líneas de negocio',
  movements: 'Entradas y salidas de stock',
  counts: 'Conteos físicos y ajustes',
  reorder: 'Qué pedir y cuánto',
  imports: 'Pedidos y recepciones al almacén',
  suppliers: 'Proveedores y contactos',
  equipment: 'Equipos y repuestos compatibles',
  users: 'Cuentas de la empresa (solo administradores)',
  settings: 'Impuestos y ajustes (solo administradores)',
};

const ACTION_LABELS: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  update: 'Editar',
  delete: 'Eliminar',
  export: 'Exportar a Excel',
  import: 'Importar desde Excel',
  'costs.view': 'Ver costos',
  'prices.view': 'Ver precios',
  manage: 'Crear, editar y eliminar',
  record: 'Registrar cantidades contadas',
  complete: 'Cerrar y aplicar ajustes',
  receive: 'Recibir en almacén',
};

export function permissionLabel(code: string): string {
  const action = code.slice(code.indexOf('.') + 1);
  return ACTION_LABELS[action] ?? action;
}
