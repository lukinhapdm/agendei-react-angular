import { createClient } from '@supabase/supabase-js';
import type { Database } from '@agendei/shared';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Falha cedo e com mensagem clara se o .env.local ou a Vercel estiverem sem as variáveis
if (!url || !key) throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY');

// Módulo ES é avaliado uma vez só, então esta é a instância única do app
export const supabase = createClient<Database>(url, key);
