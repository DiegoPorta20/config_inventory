import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MODULE_LABELS, permissionLabel } from '../../../core/labels';
import type { CatalogModule, CompanyConfig } from '../../../core/models';

const SENSITIVE = new Set(['products.costs.view', 'products.prices.view']);

@Component({
  selector: 'app-permissions-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="section-title">Permisos del personal</h2>
          <p class="mt-1 max-w-2xl text-sm text-slate-500">
            Define qué puede hacer el rol <strong>Personal</strong> en esta empresa. Los
            administradores siempre pueden hacer todo en los módulos activos. Quien tenga cualquier
            permiso de un módulo también puede verlo.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-secondary btn-sm" (click)="preset('readonly')">
            Solo lectura
          </button>
          <button type="button" class="btn btn-secondary btn-sm" (click)="preset('all')">
            Todo
          </button>
          <button type="button" class="btn btn-secondary btn-sm" (click)="preset('none')">
            Ninguno
          </button>
        </div>
      </div>

      @if (modules().length === 0) {
        <p class="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No hay módulos activos para el personal. Actívalos en la pestaña «Módulos».
        </p>
      } @else {
        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          @for (module of modules(); track module.key) {
            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="mb-2 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900">{{ label(module.key) }}</h3>
                <span class="flex gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    (click)="setModule(module, true)"
                  >
                    Todo
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    (click)="setModule(module, false)"
                  >
                    Ninguno
                  </button>
                </span>
              </div>
              <ul class="space-y-1.5">
                @for (code of module.permissions; track code) {
                  <li>
                    <label class="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        [checked]="isChecked(module, code)"
                        [disabled]="isImplied(module, code)"
                        (change)="toggle(code, $event)"
                      />
                      <span>{{ permissionText(code) }}</span>
                      @if (isSensitive(code)) {
                        <span class="badge badge-warning">Sensible</span>
                      }
                    </label>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class PermissionsTab {
  readonly config = input.required<CompanyConfig>();
  readonly catalog = input.required<CatalogModule[]>();
  readonly configChange = output<CompanyConfig>();

  protected readonly modules = computed(() =>
    this.catalog().filter(
      (module) =>
        !module.adminOnly &&
        module.permissions.length > 0 &&
        this.config().modules.includes(module.key),
    ),
  );

  private readonly granted = computed(() => new Set(this.config().permissions.PERSONAL));

  protected label(key: string): string {
    return MODULE_LABELS[key] ?? key;
  }

  protected permissionText(code: string): string {
    return permissionLabel(code);
  }

  protected isSensitive(code: string): boolean {
    return SENSITIVE.has(code);
  }

  private hasAnyOther(module: CatalogModule): boolean {
    return module.permissions.some(
      (code) => code !== `${module.key}.view` && this.granted().has(code),
    );
  }

  /** `<module>.view` is implied as soon as any other permission of the module is granted. */
  protected isImplied(module: CatalogModule, code: string): boolean {
    return code === `${module.key}.view` && this.hasAnyOther(module);
  }

  protected isChecked(module: CatalogModule, code: string): boolean {
    return this.granted().has(code) || this.isImplied(module, code);
  }

  protected toggle(code: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.granted());
    if (checked) next.add(code);
    else next.delete(code);
    this.emit(next);
  }

  protected setModule(module: CatalogModule, on: boolean): void {
    const next = new Set(this.granted());
    for (const code of module.permissions) {
      if (on) next.add(code);
      else next.delete(code);
    }
    this.emit(next);
  }

  protected preset(kind: 'readonly' | 'all' | 'none'): void {
    const all = this.catalog().flatMap((module) => (module.adminOnly ? [] : module.permissions));
    const next = new Set(
      kind === 'all'
        ? all
        : kind === 'readonly'
          ? all.filter((code) => code.endsWith('.view') && !SENSITIVE.has(code))
          : [],
    );
    this.emit(next);
  }

  private emit(next: Set<string>): void {
    const order = this.catalog().flatMap((module) => module.permissions);
    const PERSONAL = [...next].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    this.configChange.emit({ ...this.config(), permissions: { PERSONAL } });
  }
}
