import { supabase } from '../../../core/supabase/client';

// Embeds trazem negócio, serviços e expediente numa única requisição
const PUBLIC_BUSINESS_SELECT = `
  id, name, slug, timezone,
  services ( id, name, duration_min, price_cents ),
  working_hours ( weekday, start_time, end_time )
`;

export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select(PUBLIC_BUSINESS_SELECT)
    .eq('slug', slug)
    // O dono logado também enxerga serviços pausados; a vitrine mostra só os ativos
    .eq('services.active', true)
    .order('name', { referencedTable: 'services' })
    .order('start_time', { referencedTable: 'working_hours' })
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type PublicBusiness = NonNullable<Awaited<ReturnType<typeof getBusinessBySlug>>>;
export type PublicService = PublicBusiness['services'][number];
export type PublicWorkingHour = PublicBusiness['working_hours'][number];
