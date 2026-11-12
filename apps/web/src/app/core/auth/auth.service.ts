import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap } from 'rxjs';
import type { Admin } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _admin = signal<Admin | null>(null);
  readonly admin = this._admin.asReadonly();
  readonly isAuthenticated = computed(() => this._admin() !== null);

  private refreshing$: Observable<Admin> | null = null;

  async restore(): Promise<void> {
    try {
      this._admin.set(await firstValueFrom(this.http.get<Admin>('/api/auth/me')));
    } catch {
      try {
        this._admin.set(await firstValueFrom(this.refresh()));
      } catch {
        this._admin.set(null);
      }
    }
  }

  login(email: string, password: string): Observable<Admin> {
    return this.http
      .post<Admin>('/api/auth/login', { email, password })
      .pipe(tap((admin) => this._admin.set(admin)));
  }

  refresh(): Observable<Admin> {
    this.refreshing$ ??= this.http.post<Admin>('/api/auth/refresh', {}).pipe(
      tap((admin) => this._admin.set(admin)),
      finalize(() => (this.refreshing$ = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshing$;
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      catchError(() => of(undefined)),
      map(() => undefined),
      tap(() => this.clearSession()),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>('/api/auth/change-password', { currentPassword, newPassword });
  }

  expireSession(): void {
    if (!this._admin()) return;
    this.clearSession();
  }

  private clearSession(): void {
    this._admin.set(null);
    void this.router.navigate(['/login']);
  }
}
