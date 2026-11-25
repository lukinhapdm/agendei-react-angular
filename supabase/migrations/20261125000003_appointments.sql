-- Permite usar "=" com uuid dentro de um índice GiST
create extension if not exists btree_gist with schema extensions;

create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- Alvo da FK composta abaixo
alter table public.services add constraint services_id_business_id_key unique (id, business_id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  service_id uuid not null,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  check (starts_at < ends_at),
  -- Garante que o serviço pertence ao mesmo negócio do agendamento
  foreign key (service_id, business_id) references public.services (id, business_id),
  -- Evita agendamento sobreposto no mesmo negócio; cancelados liberam o horário
  constraint appointments_no_overlap exclude using gist (
    business_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create index appointments_business_id_starts_at_idx on public.appointments (business_id, starts_at);
create index appointments_customer_id_idx on public.appointments (customer_id);

alter table public.appointments enable row level security;
