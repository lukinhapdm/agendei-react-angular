-- Dados de demonstração. Antes de rodar, crie no painel (Authentication → Users → Add user,
-- com "Auto Confirm User") os usuários dono@agendei.dev e cliente@agendei.dev
do $$
declare
  v_owner_id uuid;
  v_customer_id uuid;
  v_business_id uuid;
  v_cut_id uuid;
  v_beard_id uuid;
  v_next_monday date := date_trunc('week', current_date + 7)::date;
begin
  select id into v_owner_id from auth.users where email = 'dono@agendei.dev';
  select id into v_customer_id from auth.users where email = 'cliente@agendei.dev';

  if v_owner_id is null or v_customer_id is null then
    raise exception 'Crie os usuários dono@agendei.dev e cliente@agendei.dev antes do seed';
  end if;

  -- Torna o seed seguro para rodar mais de uma vez
  if exists (select 1 from public.businesses where slug = 'barbearia-demo') then
    raise notice 'Seed já aplicado, nada a fazer';
    return;
  end if;

  update public.profiles set role = 'owner', full_name = 'Zé Barbeiro', phone = '11999990000'
  where id = v_owner_id;
  update public.profiles set full_name = 'Carla Cliente', phone = '11988880000'
  where id = v_customer_id;

  insert into public.businesses (name, slug, owner_id)
  values ('Barbearia Demo', 'barbearia-demo', v_owner_id)
  returning id into v_business_id;

  insert into public.services (business_id, name, duration_min, price_cents)
  values (v_business_id, 'Corte de cabelo', 30, 4500)
  returning id into v_cut_id;

  insert into public.services (business_id, name, duration_min, price_cents)
  values (v_business_id, 'Barba', 20, 3000)
  returning id into v_beard_id;

  insert into public.services (business_id, name, duration_min, price_cents, active)
  values (v_business_id, 'Pigmentação (pausado)', 60, 8000, false);

  -- Segunda a sexta com almoço; sábado só de manhã
  insert into public.working_hours (business_id, weekday, start_time, end_time)
  select v_business_id, d, t.s, t.e
  from generate_series(1, 5) d,
    (values ('09:00'::time, '12:00'::time), ('13:00'::time, '18:00'::time)) t(s, e)
  union all
  select v_business_id, 6, '09:00', '13:00';

  insert into public.time_off (business_id, starts_at, ends_at, reason)
  values (
    v_business_id,
    (v_next_monday + 2 + '14:00'::time) at time zone 'America/Sao_Paulo',
    (v_next_monday + 2 + '18:00'::time) at time zone 'America/Sao_Paulo',
    'Curso de capacitação'
  );

  insert into public.appointments (business_id, service_id, customer_id, starts_at, ends_at, status, notes)
  values
    (v_business_id, v_cut_id, v_customer_id,
      (v_next_monday + '10:00'::time) at time zone 'America/Sao_Paulo',
      (v_next_monday + '10:30'::time) at time zone 'America/Sao_Paulo',
      'confirmed', 'Degradê baixo'),
    (v_business_id, v_beard_id, v_customer_id,
      (v_next_monday + 1 + '15:00'::time) at time zone 'America/Sao_Paulo',
      (v_next_monday + 1 + '15:20'::time) at time zone 'America/Sao_Paulo',
      'pending', null),
    (v_business_id, v_cut_id, v_customer_id,
      (v_next_monday - 7 + '11:00'::time) at time zone 'America/Sao_Paulo',
      (v_next_monday - 7 + '11:30'::time) at time zone 'America/Sao_Paulo',
      'completed', null);
end;
$$;
