import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { errorMessage } from '../../core/http/api-utils';
import type { CatalogModule, Company, CompanyConfig } from '../../core/models';
import { isHexColor } from '../../core/palette';
import { IconComponent } from '../../shared/ui/icon.component';
import { ErrorStateComponent, TableSkeletonComponent } from '../../shared/ui/states.components';
import { ToastService } from '../../shared/ui/toast.service';
import { CompaniesApi } from './companies.api';
import { BrandingTab } from './tabs/branding.tab';
import { GeneralTab } from './tabs/general.tab';
import { ModulesTab } from './tabs/modules.tab';
import { PermissionsTab } from './tabs/permissions.tab';
import { UsersTab } from './tabs/users.tab';

type TabKey = 'general' | 'branding' | 'modules' | 'permissions' | 'users';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'branding', label: 'Marca' },
  { key: 'modules', label: 'Módulos' },
  { key: 'permissions', label: 'Permisos' },
  { key: 'users', label: 'Usuarios' },
];

@Component({
  selector: 'app-company-editor-page',
  imports: [
    RouterLink,
    IconComponent,
    ErrorStateComponent,
    TableSkeletonComponent,
    GeneralTab,
    BrandingTab,
    ModulesTab,
    PermissionsTab,
    UsersTab,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      routerLink="/companies"
      class="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
    >
      <ui-icon name="chevron-left" [size]="4" />
      Empresas
    </a>

    @if (loading()) {
      <div class="card"><ui-table-skeleton [rows]="5" [cols]="3" /></div>
    } @else if (error()) {
      <div class="card">
        <ui-error-state [message]="error()!">
          <button type="button" class="btn btn-secondary" (click)="load()">Reintentar</button>
        </ui-error-state>
      </div>
    } @else if (current(); as company) {
      <header class="mb-5 flex flex-wrap items-center gap-3">
        <h1 class="page-title">{{ company.name }}</h1>
        <span
          class="badge"
          [class]="company.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'"
        >
          {{ company.status === 'ACTIVE' ? 'Activa' : 'Suspendida' }}
        </span>
        <span class="text-sm text-slate-500">/{{ company.slug }}</span>
      </header>

      <nav class="mb-5 flex flex-wrap gap-1 border-b border-slate-200" role="tablist">
        @for (item of tabs; track item.key) {
          <button
            type="button"
            role="tab"
            class="-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors"
            [class]="
              tab() === item.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            "
            [attr.aria-selected]="tab() === item.key"
            (click)="tab.set(item.key)"
          >
            {{ item.label }}
          </button>
        }
      </nav>

      @switch (tab()) {
        @case ('general') {
          <app-general-tab [company]="company" (saved)="current.set($event)" />
        }
        @case ('branding') {
          <app-branding-tab
            [config]="draft()!"
            [company]="company"
            (configChange)="draft.set($event)"
            (companyChange)="onCompanyChange($event)"
          />
        }
        @case ('modules') {
          <app-modules-tab
            [config]="draft()!"
            [catalog]="catalog()"
            (configChange)="draft.set($event)"
          />
        }
        @case ('permissions') {
          <app-permissions-tab
            [config]="draft()!"
            [catalog]="catalog()"
            (configChange)="draft.set($event)"
          />
        }
        @case ('users') {
          <app-users-tab
            [config]="draft()!"
            [companyId]="company.id"
            [slug]="company.slug"
            (configChange)="draft.set($event)"
          />
        }
      }

      @if (dirty()) {
        <div
          class="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-3.5 pl-5 text-white shadow-xl"
          role="region"
          aria-label="Cambios sin guardar"
        >
          <span class="text-sm">
            @if (invalid()) {
              {{ invalid() }}
            } @else {
              Tienes cambios sin guardar.
            }
          </span>
          <span class="flex gap-2">
            <button type="button" class="btn btn-ghost text-white" (click)="discard()">
              Descartar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="saving() || !!invalid()"
              (click)="save()"
            >
              {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </span>
        </div>
      }
    }
  `,
})
export class CompanyEditorPage {
  readonly id = input.required<string>();

  private readonly api = inject(CompaniesApi);
  private readonly toast = inject(ToastService);

  protected readonly tabs = TABS;
  protected readonly tab = signal<TabKey>('general');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly current = signal<Company | null>(null);
  protected readonly catalog = signal<CatalogModule[]>([]);
  protected readonly draft = signal<CompanyConfig | null>(null);

  protected readonly dirty = computed(() => {
    const company = this.current();
    const draft = this.draft();
    return !!company && !!draft && JSON.stringify(company.config) !== JSON.stringify(draft);
  });

  protected readonly invalid = computed(() => {
    const branding = this.draft()?.branding;
    if (!branding) return null;
    if (!branding.appName.trim()) return 'Escribe el nombre de la aplicación.';
    if (!isHexColor(branding.primaryColor))
      return 'El color principal debe tener el formato #RRGGBB.';
    if (branding.accentColor && !isHexColor(branding.accentColor)) {
      return 'El color de acento debe tener el formato #RRGGBB.';
    }
    return null;
  });

  constructor() {
    queueMicrotask(() => this.load());
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      company: this.api.get(Number(this.id())),
      catalog: this.api.catalog(),
    }).subscribe({
      next: ({ company, catalog }) => {
        this.catalog.set(catalog.modules);
        this.setCompany(company);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(errorMessage(error, 'No se pudo cargar la empresa.'));
        this.loading.set(false);
      },
    });
  }

  /** The general tab saves name/status on its own; keep any unsaved config edits. */
  protected onCompanyChange(company: Company): void {
    this.current.set(company);
  }

  protected save(): void {
    const draft = this.draft();
    const company = this.current();
    if (!draft || !company || this.saving() || this.invalid()) return;

    this.saving.set(true);
    this.api.saveConfig(company.id, draft).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.setCompany(saved);
        this.toast.success('Configuración guardada.');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.toast.error(errorMessage(error, 'No se pudo guardar la configuración.'));
      },
    });
  }

  protected discard(): void {
    const company = this.current();
    if (company) this.draft.set(structuredClone(company.config));
  }

  private setCompany(company: Company): void {
    this.current.set(company);
    this.draft.set(structuredClone(company.config));
  }
}
