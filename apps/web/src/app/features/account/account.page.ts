import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage } from '../../core/http/api-utils';
import { PageHeaderComponent } from '../../shared/ui/layout.components';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-account-page',
  imports: [ReactiveFormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-page-header title="Mi cuenta" subtitle="Datos de acceso del super administrador." />

    <section class="card max-w-xl p-6">
      <dl class="mb-6 grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
        <dt class="text-slate-500">Nombre</dt>
        <dd class="font-semibold">{{ auth.admin()?.name }}</dd>
        <dt class="text-slate-500">Correo</dt>
        <dd class="font-semibold">{{ auth.admin()?.email }}</dd>
      </dl>

      <h2 class="section-title mb-3">Cambiar contraseña</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        <div>
          <label class="label" for="current">Contraseña actual</label>
          <input id="current" class="input" type="password" formControlName="currentPassword" />
        </div>
        <div>
          <label class="label" for="next">Nueva contraseña</label>
          <input id="next" class="input" type="password" formControlName="newPassword" />
          @if (form.controls.newPassword.touched && form.controls.newPassword.invalid) {
            <p class="field-error">Usa al menos 8 caracteres.</p>
          }
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="pending()">
          {{ pending() ? 'Guardando…' : 'Cambiar contraseña' }}
        </button>
      </form>
    </section>
  `,
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly pending = signal(false);
  protected readonly form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.pending.set(false);
        this.form.reset();
        this.toast.success('Contraseña actualizada.');
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.toast.error(errorMessage(error, 'No se pudo cambiar la contraseña.'));
      },
    });
  }
}
