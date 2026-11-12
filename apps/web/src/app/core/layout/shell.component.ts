import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent, type IconName } from '../../shared/ui/icon.component';
import { AuthService } from '../auth/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
}

const NAV: NavItem[] = [
  { label: 'Empresas', path: '/companies', icon: 'building' },
  { label: 'Mi cuenta', path: '/account', icon: 'user' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (menuOpen()) {
      <div
        class="fixed inset-0 z-30 bg-brand-950/40 backdrop-blur-[3px] lg:hidden"
        (click)="menuOpen.set(false)"
        aria-hidden="true"
      ></div>
    }

    <aside
      class="fixed inset-y-0 left-0 z-40 w-[17rem] p-3.5 transition-transform duration-500 ease-(--ease-soft) lg:translate-x-0"
      [class]="menuOpen() ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Navegación principal"
    >
      <div class="side-panel">
        <div class="flex items-center gap-3 px-1 pb-4">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-brand-100 text-brand-900"
          >
            <ui-icon name="wrench" [size]="5" />
          </span>
          <div class="min-w-0 leading-tight">
            <p class="text-[19px] font-bold tracking-tight">Configuración</p>
            <p class="truncate text-xs" style="color: var(--side-dim)">Empresas de inventario</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="is-on bg-brand-100!"
              class="nav-item"
              (click)="menuOpen.set(false)"
            >
              <ui-icon [name]="item.icon" [size]="5" />
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="border-t border-white/10 pt-3">
          <p class="truncate px-3 text-sm font-semibold">{{ auth.admin()?.name }}</p>
          <p class="truncate px-3 pb-2 text-xs" style="color: var(--side-dim)">
            {{ auth.admin()?.email }}
          </p>
          <button type="button" class="nav-item w-full" (click)="logout()">
            <ui-icon name="logout" [size]="5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>

    <div class="lg:pl-[17rem]">
      <header class="flex items-center gap-3 px-(--gutter) pt-4 lg:hidden">
        <button
          type="button"
          class="btn btn-secondary btn-icon rounded-full"
          aria-label="Abrir menú"
          (click)="menuOpen.set(true)"
        >
          <ui-icon name="menu" [size]="5" />
        </button>
      </header>
      <main id="main" class="px-(--gutter) py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly nav = NAV;
  protected readonly menuOpen = signal(false);

  protected logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigate(['/login']));
  }
}
