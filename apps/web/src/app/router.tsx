import { createBrowserRouter } from 'react-router';
import { guestOnly, requireAuth } from '../core/auth/guards';
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
        path: 'b/:slug/agendar',
        lazy: {
          Component: async () => (await import('../features/booking/BookingPage')).BookingPage,
        },
      },
      {
        path: 'b/:slug/confirmar',
        // Sem sessão, vai ao login e volta para cá com a mesma escolha
        loader: requireAuth,
        lazy: {
          Component: async () => (await import('../features/booking/ConfirmPage')).ConfirmPage,
        },
      },
      {
        path: 'entrar',
        loader: guestOnly,
        lazy: { Component: async () => (await import('../features/auth/LoginPage')).LoginPage },
      },
      {
        path: 'meus-agendamentos',
        // Guard roda antes de baixar o chunk da página
        loader: requireAuth,
        lazy: {
          Component: async () =>
            (await import('../features/appointments/MyAppointmentsPage')).MyAppointmentsPage,
        },
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
