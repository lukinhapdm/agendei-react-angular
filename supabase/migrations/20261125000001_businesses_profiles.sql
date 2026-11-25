-- Papel do usuário na plataforma
create type public.user_role as enum ('owner', 'customer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  -- Usado na URL pública: /b/:slug
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  timezone text not null default 'America/Sao_Paulo',
  -- Um negócio por dono para manter o MVP simples
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Cria o profile automaticamente quando alguém se cadastra no Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    case when new.raw_user_meta_data ->> 'role' = 'owner'
      then 'owner'::public.user_role
      else 'customer'::public.user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS ligado sem políticas bloqueia tudo até a etapa 2.5
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
