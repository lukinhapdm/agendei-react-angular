import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados de agenda mudam pouco em segundos; evita refetch a cada troca de tela
      staleTime: 30_000,
      retry: 1,
    },
  },
});
