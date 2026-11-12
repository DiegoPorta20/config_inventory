import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { errorMessage } from '../../core/http/api-utils';
import type { CompanySummary } from '../../core/models';
import { IconComponent } from '../../shared/ui/icon.component';
import { PageHeaderComponent } from '../../shared/ui/layout.components';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  TableSkeletonComponent,
} from '../../shared/ui/states.components';
import { CompaniesApi } from './companies.api';
import { openNewCompanyDialog } from './new-company.dialog';

@Component({
  selector: 'app-companies-list-page',
  imports: [
    RouterLink,
    IconComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    TableSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-page-header
      title="Empresas"
      subtitle="Cada empresa tiene su marca, módulos, permisos y límite de usuarios."
    >
      <button type="button" class="btn btn-primary" (click)="create()">
        <ui-icon name="plus" [size]="4" />
        Nueva empresa
      </button>
    </ui-page-header>

    <section class="card overflow-hidden">
      @if (loading()) {
        <ui-table-skeleton [rows]="5" [cols]="5" />
      } @else if (error()) {
        <ui-error-state [message]="error()!">
          <button type="button" class="btn btn-secondary" (click)="load()">Reintentar</button>
        </ui-error-state>
      } @else if (companies().length === 0) {
        <ui-empty-state
          icon="building"
          title="Aún no hay empresas"
          description="Crea la primera para empezar a configurarla."
        >
          <button type="button" class="btn btn-primary" (click)="create()">Nueva empresa</button>
        </ui-empty-state>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Dirección de ingreso</th>
                <th>Estado</th>
                <th class="num">Módulos</th>
                <th class="num">Usuarios máx.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (company of companies(); track company.id) {
                <tr class="row-link" (click)="open(company.id)">
                  <td>
                    <a
                      class="font-semibold text-slate-900 hover:underline"
                      [routerLink]="['/companies', company.id]"
                      (click)="$event.stopPropagation()"
                      >{{ company.name }}</a
                    >
                  </td>
                  <td class="text-slate-500">/{{ company.slug }}</td>
                  <td>
                    <span
                      class="badge"
                      [class]="company.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'"
                    >
                      {{ company.status === 'ACTIVE' ? 'Activa' : 'Suspendida' }}
                    </span>
                  </td>
                  <td class="num">{{ company.config.modules.length }}</td>
                  <td class="num">{{ company.config.limits.maxUsers ?? 'Sin límite' }}</td>
                  <td class="text-right text-slate-400">
                    <ui-icon name="chevron-right" [size]="4" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class CompaniesListPage {
  private readonly api = inject(CompaniesApi);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);

  protected readonly companies = signal<CompanySummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(errorMessage(error, 'No se pudieron cargar las empresas.'));
        this.loading.set(false);
      },
    });
  }

  protected open(id: number): void {
    void this.router.navigate(['/companies', id]);
  }

  protected async create(): Promise<void> {
    const company = await firstValueFrom(openNewCompanyDialog(this.dialog).closed, {
      defaultValue: undefined,
    });
    if (company) void this.router.navigate(['/companies', company.id]);
  }
}
