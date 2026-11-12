import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · Configuración',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'companies' },
      {
        path: 'companies',
        title: 'Empresas · Configuración',
        loadComponent: () =>
          import('./features/companies/companies-list.page').then((m) => m.CompaniesListPage),
      },
      {
        path: 'companies/:id',
        title: 'Empresa · Configuración',
        loadComponent: () =>
          import('./features/companies/company-editor.page').then((m) => m.CompanyEditorPage),
      },
      {
        path: 'account',
        title: 'Mi cuenta · Configuración',
        loadComponent: () => import('./features/account/account.page').then((m) => m.AccountPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
