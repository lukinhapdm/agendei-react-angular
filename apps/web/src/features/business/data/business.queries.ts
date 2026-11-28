import { queryOptions } from '@tanstack/react-query';
import { getBusinessBySlug } from './business.repository';

// Chaves hierárquicas permitem invalidar tudo de 'business' de uma vez
export const businessKeys = {
  all: ['business'] as const,
  bySlug: (slug: string) => [...businessKeys.all, 'slug', slug] as const,
};

export const businessBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: businessKeys.bySlug(slug),
    queryFn: () => getBusinessBySlug(slug),
  });
