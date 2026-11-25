create function public.get_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date
)
returns table (slot_start timestamptz, slot_end timestamptz)
language sql
stable
-- Lê time_off e appointments sem expor os dados privados dessas tabelas
security definer
set search_path = ''
as $$
  with params as (
    select b.timezone as tz, make_interval(mins => s.duration_min) as duration
    from public.businesses b
    join public.services s on s.business_id = b.id
    where b.id = p_business_id and s.id = p_service_id and s.active
  ),
  windows as (
    -- Converte o horário local do negócio para um instante real (UTC)
    select
      (p_date + wh.start_time) at time zone p.tz as window_start,
      (p_date + wh.end_time) at time zone p.tz as window_end,
      p.duration
    from public.working_hours wh, params p
    where wh.business_id = p_business_id
      and wh.weekday = extract(dow from p_date)
  ),
  candidates as (
    -- Grade de 15 em 15 minutos dentro de cada janela de atendimento
    select gs as slot_start, gs + w.duration as slot_end
    from windows w,
      generate_series(w.window_start, w.window_end - w.duration, interval '15 minutes') gs
  )
  select c.slot_start, c.slot_end
  from candidates c
  where c.slot_start > now()
    and not exists (
      select 1 from public.appointments a
      where a.business_id = p_business_id
        and a.status in ('pending', 'confirmed')
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(c.slot_start, c.slot_end, '[)')
    )
    and not exists (
      select 1 from public.time_off t
      where t.business_id = p_business_id
        and tstzrange(t.starts_at, t.ends_at, '[)') && tstzrange(c.slot_start, c.slot_end, '[)')
    )
  order by c.slot_start;
$$;

revoke execute on function public.get_available_slots(uuid, uuid, date) from public;
grant execute on function public.get_available_slots(uuid, uuid, date) to anon, authenticated;
