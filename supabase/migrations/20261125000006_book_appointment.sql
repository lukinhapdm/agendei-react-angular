create function public.book_appointment(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_notes text default null
)
returns public.appointments
language plpgsql
-- Única porta de entrada para criar agendamentos (insert direto foi revogado na 2.5)
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := auth.uid();
  v_business_id uuid;
  v_timezone text;
  v_duration integer;
  v_appointment public.appointments;
begin
  if v_customer_id is null then
    raise exception 'not_authenticated';
  end if;

  select s.business_id, b.timezone, s.duration_min
    into v_business_id, v_timezone, v_duration
  from public.services s
  join public.businesses b on b.id = s.business_id
  where s.id = p_service_id and s.active;

  if v_business_id is null then
    raise exception 'service_not_found';
  end if;

  -- Reaproveita a regra de disponibilidade em vez de duplicá-la
  if not exists (
    select 1
    from public.get_available_slots(
      v_business_id,
      p_service_id,
      (p_starts_at at time zone v_timezone)::date
    ) slot
    where slot.slot_start = p_starts_at
  ) then
    raise exception 'slot_unavailable';
  end if;

  insert into public.appointments (business_id, service_id, customer_id, starts_at, ends_at, notes)
  values (
    v_business_id,
    p_service_id,
    v_customer_id,
    p_starts_at,
    p_starts_at + make_interval(mins => v_duration),
    nullif(trim(p_notes), '')
  )
  returning * into v_appointment;

  return v_appointment;
exception
  -- Duas reservas simultâneas: a EXCLUDE constraint barra a segunda
  when exclusion_violation then
    raise exception 'slot_unavailable';
end;
$$;

revoke execute on function public.book_appointment(uuid, timestamptz, text) from public, anon;
grant execute on function public.book_appointment(uuid, timestamptz, text) to authenticated;
