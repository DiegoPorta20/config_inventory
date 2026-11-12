import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../../core/http/api-utils';
import type { CompanyConfig, ProvisionedAdmin } from '../../../core/models';
import { ToastService } from '../../../shared/ui/toast.service';
import { CompaniesApi } from '../companies.api';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function randomPassword(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

@Component({
  selector: 'app-users-tab',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card max-w-2xl p-6">
      <h2 class="section-title">Límite de usuarios</h2>
      <p class="mt-1 mb-4 text-sm text-slate-500">
        Cantidad máxima de cuentas (administradores y personal) que la empresa puede tener.
      </p>
      <label class="mb-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          [checked]="config().limits.maxUsers === null"
          (change)="setUnlimited($event)"
        />
        Sin límite
      </label>
      @if (config().limits.maxUsers !== null) {
        <label class="label" for="maxUsers">Máximo de usuarios</label>
        <input
          id="maxUsers"
          class="input w-40"
          type="number"
          min="1"
          max="100000"
          [value]="config().limits.maxUsers"
          (input)="setMax($event)"
        />
      }
    </section>

    <section class="card mt-5 max-w-2xl p-6">
      <h2 class="section-title">Crear administrador</h2>
      <p class="mt-1 mb-4 text-sm text-slate-500">
        Crea una cuenta de administrador en la aplicación de inventario de esta empresa. Con ella
        podrán registrar a su personal.
      </p>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="adminName">Nombre</label>
            <input id="adminName" class="input" formControlName="name" />
          </div>
          <div>
            <label class="label" for="adminEmail">Correo</label>
            <input id="adminEmail" class="input" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="field-error">Ingresa un correo válido.</p>
            }
          </div>
        </div>
        <div>
          <label class="label" for="adminPassword">Contraseña inicial</label>
          <div class="flex gap-2">
            <input id="adminPassword" class="input font-mono" formControlName="password" />
            <button type="button" class="btn btn-secondary shrink-0" (click)="generate()">
              Generar
            </button>
          </div>
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <p class="field-error">Usa al menos 8 caracteres.</p>
          }
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="pending()">
          {{ pending() ? 'Creando…' : 'Crear administrador' }}
        </button>
      </form>

      @if (created(); as admin) {
        <div class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p class="font-semibold text-emerald-800">Administrador creado</p>
          <p class="mt-1 text-emerald-900">
            {{ admin.email }} · contraseña <span class="font-mono">{{ lastPassword() }}</span>
          </p>
          <p class="mt-1 text-xs text-emerald-800">
            Cópiala ahora: no se vuelve a mostrar. Ingresa en /{{ slug() }}.
          </p>
        </div>
      }
    </section>
  `,
})
export class UsersTab {
  readonly config = input.required<CompanyConfig>();
  readonly companyId = input.required<number>();
  readonly slug = input.required<string>();
  readonly configChange = output<CompanyConfig>();

  private readonly api = inject(CompaniesApi);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly pending = signal(false);
  protected readonly created = signal<ProvisionedAdmin | null>(null);
  protected readonly lastPassword = signal('');
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: [randomPassword(), [Validators.required, Validators.minLength(8)]],
  });

  protected setUnlimited(event: Event): void {
    const unlimited = (event.target as HTMLInputElement).checked;
    this.configChange.emit({
      ...this.config(),
      limits: { maxUsers: unlimited ? null : 10 },
    });
  }

  protected setMax(event: Event): void {
    const value = Math.floor(Number((event.target as HTMLInputElement).value));
    if (!Number.isFinite(value) || value < 1) return;
    this.configChange.emit({ ...this.config(), limits: { maxUsers: Math.min(value, 100_000) } });
  }

  protected generate(): void {
    this.form.controls.password.setValue(randomPassword());
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    const body = this.form.getRawValue();
    this.api.createAdmin(this.companyId(), body).subscribe({
      next: (admin) => {
        this.pending.set(false);
        this.created.set(admin);
        this.lastPassword.set(body.password);
        this.form.reset({ name: '', email: '', password: randomPassword() });
        this.toast.success('Administrador creado.');
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.toast.error(errorMessage(error, 'No se pudo crear el administrador.'));
      },
    });
  }
}
