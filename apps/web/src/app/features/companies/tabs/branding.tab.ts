import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { errorMessage } from '../../../core/http/api-utils';
import type { Company, CompanyConfig } from '../../../core/models';
import { buildPalette, isHexColor } from '../../../core/palette';
import { IconComponent } from '../../../shared/ui/icon.component';
import { imageToDataUrl } from '../../../shared/util/image';
import { ToastService } from '../../../shared/ui/toast.service';
import { CompaniesApi } from '../companies.api';

@Component({
  selector: 'app-branding-tab',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section class="card space-y-5 p-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="appName">Nombre de la aplicación</label>
            <input
              id="appName"
              class="input"
              maxlength="60"
              [value]="config().branding.appName"
              (input)="patchBranding({ appName: text($event) })"
            />
            <p class="mt-1 text-xs text-slate-500">
              Se muestra en el menú y en el inicio de sesión.
            </p>
          </div>
          <div>
            <label class="label" for="tagline">Subtítulo</label>
            <input
              id="tagline"
              class="input"
              maxlength="120"
              [value]="config().branding.tagline ?? ''"
              (input)="patchBranding({ tagline: text($event) || null })"
            />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="primary">Color principal</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                aria-label="Elegir color principal"
                [value]="primaryColor()"
                (input)="patchBranding({ primaryColor: text($event) })"
              />
              <input
                id="primary"
                class="input font-mono"
                maxlength="7"
                [value]="config().branding.primaryColor"
                (input)="patchColor('primaryColor', text($event))"
              />
            </div>
            @if (!validPrimary()) {
              <p class="field-error">Usa el formato #RRGGBB.</p>
            }
          </div>
          <div>
            <label class="label" for="accent">Color de acento (opcional)</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                aria-label="Elegir color de acento"
                [value]="accentColor()"
                (input)="patchBranding({ accentColor: text($event) })"
              />
              <input
                id="accent"
                class="input font-mono"
                maxlength="7"
                [value]="config().branding.accentColor ?? ''"
                placeholder="#RRGGBB"
                (input)="patchColor('accentColor', text($event))"
              />
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          @for (slot of imageSlots(); track slot.kind) {
            <div>
              <span class="label">{{ slot.label }}</span>
              <div class="flex items-center gap-3">
                <span
                  class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  @if (slot.url) {
                    <img [src]="slot.url" [alt]="slot.label" class="size-full object-contain" />
                  } @else {
                    <ui-icon name="box" [size]="6" />
                  }
                </span>
                <div class="flex flex-col gap-1.5">
                  <label class="btn btn-secondary btn-sm cursor-pointer">
                    <ui-icon name="upload" [size]="4" />
                    Subir
                    <input
                      type="file"
                      class="sr-only"
                      accept="image/png,image/jpeg,image/webp"
                      (change)="upload(slot.kind, $event)"
                    />
                  </label>
                  @if (slot.url) {
                    <button type="button" class="btn btn-ghost btn-sm" (click)="remove(slot.kind)">
                      Quitar
                    </button>
                  }
                </div>
              </div>
              <p class="mt-1 text-xs text-slate-500">{{ slot.hint }}</p>
            </div>
          }
        </div>
        <p class="text-xs text-slate-500">
          Las imágenes se guardan al subirlas; los demás cambios, con «Guardar cambios».
        </p>
      </section>

      <aside class="space-y-2">
        <p class="label">Vista previa</p>
        <div
          class="overflow-hidden rounded-2xl border border-slate-200"
          style="background: #eceff5"
        >
          <div class="flex min-h-72">
            <div class="w-36 shrink-0 p-3 text-white" [style.background]="palette()[900]">
              <div class="mb-4 flex items-center gap-2">
                <span
                  class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  [style.background]="palette()[100]"
                  [style.color]="palette()[900]"
                >
                  @if (company().logoDataUrl) {
                    <img [src]="company().logoDataUrl" alt="" class="size-full object-contain" />
                  } @else {
                    <ui-icon name="box" [size]="4" />
                  }
                </span>
                <span class="truncate text-xs font-bold">{{ config().branding.appName }}</span>
              </div>
              <div
                class="mb-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold"
                [style.background]="palette()[100]"
                [style.color]="palette()[900]"
              >
                Productos
              </div>
              <div class="px-2 py-1.5 text-[11px] opacity-70">Movimientos</div>
              <div class="px-2 py-1.5 text-[11px] opacity-70">Conteos</div>
            </div>
            <div class="flex-1 p-3" style="color: #0f172a">
              <p class="text-xs font-bold">Productos</p>
              <p class="mb-3 text-[10px] opacity-60">{{ config().branding.tagline ?? ' ' }}</p>
              <span
                class="inline-block rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
                [style.background]="palette()[600]"
                >Nuevo producto</span
              >
              <div class="mt-3 flex gap-1.5">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  [style.background]="palette()[100]"
                  [style.color]="palette()[700]"
                  >En stock</span
                >
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  [style.background]="accentShade()"
                  >Pedido</span
                >
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `,
})
export class BrandingTab {
  readonly config = input.required<CompanyConfig>();
  readonly company = input.required<Company>();
  readonly configChange = output<CompanyConfig>();
  readonly companyChange = output<Company>();

  private readonly api = inject(CompaniesApi);
  private readonly toast = inject(ToastService);

  protected readonly validPrimary = computed(() => isHexColor(this.config().branding.primaryColor));
  protected readonly primaryColor = computed(() =>
    this.validPrimary() ? this.config().branding.primaryColor : '#273f85',
  );
  protected readonly accentColor = computed(() => {
    const accent = this.config().branding.accentColor;
    return accent && isHexColor(accent) ? accent : '#01abce';
  });
  protected readonly palette = computed(() => buildPalette(this.primaryColor()));
  protected readonly accentShade = computed(() =>
    this.config().branding.accentColor ? this.accentColor() : this.palette()[500],
  );

  protected readonly imageSlots = computed(() => [
    {
      kind: 'logo' as const,
      label: 'Logo',
      url: this.company().logoDataUrl,
      hint: 'PNG, JPG o WebP. Se ajusta a 512 px.',
    },
    {
      kind: 'favicon' as const,
      label: 'Ícono (favicon)',
      url: this.company().faviconDataUrl,
      hint: 'Cuadrado. Se ajusta a 128 px.',
    },
  ]);

  protected text(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected patchBranding(changes: Partial<CompanyConfig['branding']>): void {
    this.configChange.emit({
      ...this.config(),
      branding: { ...this.config().branding, ...changes },
    });
  }

  protected patchColor(key: 'primaryColor' | 'accentColor', value: string): void {
    const normalized = value.startsWith('#') || value === '' ? value : `#${value}`;
    this.patchBranding(
      key === 'accentColor' ? { accentColor: normalized || null } : { primaryColor: normalized },
    );
  }

  protected async upload(kind: 'logo' | 'favicon', event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const dataUrl = await imageToDataUrl(file, kind === 'logo' ? 512 : 128);
      this.save(kind, dataUrl);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo leer la imagen.');
    }
  }

  protected remove(kind: 'logo' | 'favicon'): void {
    this.save(kind, null);
  }

  private save(kind: 'logo' | 'favicon', dataUrl: string | null): void {
    const request =
      kind === 'logo'
        ? this.api.setLogo(this.company().id, dataUrl)
        : this.api.setFavicon(this.company().id, dataUrl);
    request.subscribe({
      next: (company) => {
        this.companyChange.emit(company);
        this.toast.success(dataUrl ? 'Imagen guardada.' : 'Imagen quitada.');
      },
      error: (error: unknown) =>
        this.toast.error(errorMessage(error, 'No se pudo guardar la imagen.')),
    });
  }
}
