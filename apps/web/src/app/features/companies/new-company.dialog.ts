import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../core/http/api-utils';
import type { Company } from '../../core/models';
import { DialogFrameComponent } from '../../shared/ui/dialog-frame.component';
import { CompaniesApi } from './companies.api';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

const toSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

@Component({
  selector: 'app-new-company-dialog',
  imports: [ReactiveFormsModule, DialogFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-dialog-frame
      title="Nueva empresa"
      subtitle="Después podrás configurar su marca, módulos y permisos."
    >
      <form id="new-company" [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
        <div>
          <label class="label" for="name">Nombre de la empresa</label>
          <input id="name" class="input" formControlName="name" autofocus (input)="syncSlug()" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <p class="field-error">Ingresa el nombre.</p>
          }
        </div>
        <div>
          <label class="label" for="slug">Identificador en la dirección</label>
          <input id="slug" class="input" formControlName="slug" (input)="slugEdited = true" />
          <p class="mt-1 text-xs text-slate-500">
            Los usuarios ingresarán por
            <strong>/{{ form.controls.slug.value || 'identificador' }}</strong
            >. No se puede cambiar después.
          </p>
          @if (form.controls.slug.touched && form.controls.slug.invalid) {
            <p class="field-error">Usa de 3 a 60 letras minúsculas, números o guiones.</p>
          }
        </div>
        @if (error()) {
          <p class="field-error" role="alert">{{ error() }}</p>
        }
      </form>
      <ng-container dialog-actions>
        <button type="button" class="btn btn-secondary" (click)="ref.close()">Cancelar</button>
        <button type="submit" form="new-company" class="btn btn-primary" [disabled]="pending()">
          {{ pending() ? 'Creando…' : 'Crear empresa' }}
        </button>
      </ng-container>
    </ui-dialog-frame>
  `,
})
export class NewCompanyDialog {
  protected readonly ref = inject<DialogRef<Company>>(DialogRef);
  private readonly api = inject(CompaniesApi);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected slugEdited = false;
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    slug: ['', [Validators.required, Validators.pattern(SLUG_PATTERN)]],
  });

  protected syncSlug(): void {
    if (!this.slugEdited) this.form.controls.slug.setValue(toSlug(this.form.controls.name.value));
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.error.set(null);
    this.api.create(this.form.getRawValue()).subscribe({
      next: (company) => this.ref.close(company),
      error: (error: unknown) => {
        this.pending.set(false);
        this.error.set(errorMessage(error, 'No se pudo crear la empresa.'));
      },
    });
  }
}

export function openNewCompanyDialog(dialog: Dialog): DialogRef<Company> {
  return dialog.open<Company>(NewCompanyDialog, { ariaModal: true, autoFocus: 'first-tabbable' });
}
