import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
  LOCALE_ID,
  type ApplicationConfig,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAppInitializer(() => inject(AuthService).restore()),
    { provide: LOCALE_ID, useValue: 'es-PE' },
  ],
};
