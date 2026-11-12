import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MODULE_DESCRIPTIONS, MODULE_LABELS } from '../../../core/labels';
import type { CatalogModule, CompanyConfig } from '../../../core/models';

@Component({
  selector: 'app-modules-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card p-6">
      <h2 class="section-title">Módulos activos</h2>
      <p class="mt-1 mb-4 text-sm text-slate-500">
        Lo que no actives no aparece en el menú ni en la aplicación móvil de esta empresa.
      </p>
      <ul class="grid gap-2 sm:grid-cols-2">
        @for (module of catalog(); track module.key) {
          <li>
            <label
              class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                class="mt-1"
                [checked]="isOn(module.key)"
                (change)="toggle(module.key, $event)"
              />
              <span>
                <span class="block text-sm font-semibold text-slate-900">
                  {{ label(module.key) }}
                  @if (module.adminOnly) {
                    <span class="badge badge-neutral ml-1">Solo administrador</span>
                  }
                </span>
                <span class="block text-xs text-slate-500">{{ description(module.key) }}</span>
              </span>
            </label>
          </li>
        }
      </ul>
    </section>
  `,
})
export class ModulesTab {
  readonly config = input.required<CompanyConfig>();
  readonly catalog = input.required<CatalogModule[]>();
  readonly configChange = output<CompanyConfig>();

  protected label(key: string): string {
    return MODULE_LABELS[key] ?? key;
  }

  protected description(key: string): string {
    return MODULE_DESCRIPTIONS[key] ?? '';
  }

  protected isOn(key: string): boolean {
    return this.config().modules.includes(key);
  }

  protected toggle(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const others = this.config().modules.filter((module) => module !== key);
    const order = this.catalog().map((module) => module.key);
    const modules = (checked ? [...others, key] : others).sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    );
    this.configChange.emit({ ...this.config(), modules });
  }
}
