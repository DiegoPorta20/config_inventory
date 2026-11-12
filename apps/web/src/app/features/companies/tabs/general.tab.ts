import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../../core/http/api-utils';
import type { Company, CompanyStatus } from '../../../core/models';
import { ConfirmService } from '../../../shared/ui/confirm.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { CompaniesApi } from '../companies.api';

@Component({
  selector: 'app-general-tab',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card max-w-2xl p-6">
      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-5" novalidate>
        <div>
          <label class="label" for="name">Nombre de la empresa</label>
          <input id="name" class="input" formControlName="name" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <p class="field-error">Ingresa el nombre.</p>
          }
        </div>
        <div>
          <span class="label">Dirección de ingreso</span>
          <p class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            /{{ company().slug }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Los usuarios inician sesión en esta dirección. No se puede cambiar.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button type="submit" class="btn btn-primary" [disabled]="pending() || form.pristine">
            {{ pending() ? 'Guardando…' : 'Guardar nombre' }}
          </button>
        </div>
      </form>
    </section>

    <section class="card mt-5 max-w-2xl p-6">
      <h2 class="section-title">Estado</h2>
      @if (company().status === 'ACTIVE') {
        <p class="mt-1 text-sm text-slate-500">
          La empresa está activa. Suspenderla impide que sus usuarios inicien sesión; sus datos se
          conservan.
        </p>
        <button type="button" class="btn btn-danger mt-4" (click)="setStatus('SUSPENDED')">
          Suspender empresa
        </button>
      } @else {
        <p class="mt-1 text-sm text-amber-700">
          La empresa está suspendida: sus usuarios no pueden iniciar sesión.
        </p>
        <button type="button" class="btn btn-primary mt-4" (click)="setStatus('ACTIVE')">
          Reactivar empresa
        </button>
      }
    </section>
  `,
})
export class GeneralTab {
  readonly company = input.required<Company>();
  readonly saved = output<Company>();

  private readonly api = inject(CompaniesApi);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly pending = signal(false);
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
  });

  constructor() {
    effect(() => this.form.reset({ name: this.company().name }));
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;
    this.apply({ name: this.form.getRawValue().name }, 'Nombre actualizado.');
  }

  protected async setStatus(status: CompanyStatus): Promise<void> {
    if (status === 'SUSPENDED') {
      const ok = await this.confirm.confirm({
        title: 'Suspender empresa',
        message: `Los usuarios de ${this.company().name} no podrán iniciar sesión hasta que la reactives.`,
        confirmLabel: 'Suspender',
        danger: true,
      });
      if (!ok) return;
    }
    this.apply({ status }, status === 'ACTIVE' ? 'Empresa reactivada.' : 'Empresa suspendida.');
  }

  private apply(changes: { name?: string; status?: CompanyStatus }, message: string): void {
    this.pending.set(true);
    this.api.update(this.company().id, changes).subscribe({
      next: (company) => {
        this.pending.set(false);
        this.toast.success(message);
        this.saved.emit(company);
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.toast.error(errorMessage(error, 'No se pudo guardar.'));
      },
    });
  }
}
