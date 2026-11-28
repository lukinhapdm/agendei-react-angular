import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../layout/RootLayout';
import { NotFoundPage } from './NotFoundPage';

// Cada página vira um chunk separado, baixado só quando a rota é visitada
export const router = createBrowserRouter([
  {
    Component: RootLayout,
    // Exibido enquanto o chunk da primeira rota ainda está baixando
    HydrateFallback: () => null,
    children: [
      {
        index: true,
        lazy: { Component: async () => (await import('../features/home/HomePage')).HomePage },
      },
      {
        path: 'b/:slug',
        lazy: {
          Component: async () => (await import('../features/business/BusinessPage')).BusinessPage,
        },
      },
      {
        path: 'entrar',
        lazy: { Component: async () => (await import('../features/auth/LoginPage')).LoginPage },
      },
      {
        path: 'meus-agendamentos',
        lazy: {
          Component: async () =>
            (await import('../features/appointments/MyAppointmentsPage')).MyAppointmentsPage,
        },
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
