import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar · Agendei',
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Agendei',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'agenda',
        title: 'Agenda · Agendei',
        loadComponent: () => import('./features/agenda/agenda-page').then((m) => m.AgendaPage),
      },
      {
        path: 'services',
        title: 'Serviços · Agendei',
        loadComponent: () =>
          import('./features/services/services-page').then((m) => m.ServicesPage),
      },
      {
        path: 'schedule',
        title: 'Horários · Agendei',
        loadComponent: () =>
          import('./features/schedule/schedule-page').then((m) => m.SchedulePage),
      },
      {
        path: 'customers',
        title: 'Clientes · Agendei',
        loadComponent: () =>
          import('./features/customers/customers-page').then((m) => m.CustomersPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
