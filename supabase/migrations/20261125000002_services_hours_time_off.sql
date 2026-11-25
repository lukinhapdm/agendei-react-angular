create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  -- Múltiplo de 5 para casar com a grade de horários
  duration_min integer not null check (duration_min between 5 and 480 and duration_min % 5 = 0),
  -- Centavos evitam erro de arredondamento com float
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index services_business_id_idx on public.services (business_id);

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- 0 = domingo ... 6 = sábado, igual ao Date.getDay() do JS
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (start_time < end_time),
  -- Permite mais de um intervalo por dia (ex.: pausa para almoço)
  unique (business_id, weekday, start_time)
);

create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (starts_at < ends_at)
);

create index time_off_business_id_starts_at_idx on public.time_off (business_id, starts_at);

alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_off enable row level security;
