import type { Tables } from '@agendei/shared';
import { supabase } from '../../../core/supabase/client';

export type PublicBusiness = Pick<Tables<'businesses'>, 'id' | 'name' | 'slug' | 'timezone'>;

export async function getBusinessBySlug(slug: string): Promise<PublicBusiness | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, timezone')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
