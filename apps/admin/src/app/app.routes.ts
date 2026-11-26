import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { authGuard, guestGuard } from './core/auth/auth.guards';
import { hasBusinessGuard, noBusinessGuard } from './core/business/business.guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar · Agendei',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    title: 'Criar conta · Agendei',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/signup-page').then((m) => m.SignupPage),
  },
  {
    path: 'onboarding',
    title: 'Crie seu negócio · Agendei',
    canActivate: [authGuard, noBusinessGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding-page').then((m) => m.OnboardingPage),
  },
  {
    path: '',
    component: Shell,
    // Exige login e negócio criado; os guards de uma rota rodam em paralelo
    canActivate: [authGuard, hasBusinessGuard],
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
