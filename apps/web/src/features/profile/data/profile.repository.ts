import { supabase } from '../../../core/supabase/client';

export async function getOwnProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateOwnProfile(
  userId: string,
  changes: { full_name: string; phone: string },
) {
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
  if (error) throw error;
}
