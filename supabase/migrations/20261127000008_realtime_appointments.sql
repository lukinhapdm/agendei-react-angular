-- Publica as mudanças de appointments no Realtime; o RLS de select continua filtrando quem recebe
alter publication supabase_realtime add table public.appointments;
