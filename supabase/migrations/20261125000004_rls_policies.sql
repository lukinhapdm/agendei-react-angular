-- security definer evita recursão de RLS ao consultar businesses dentro de outras políticas
create function public.is_business_owner(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.businesses
    where id = target_business_id and owner_id = (select auth.uid())
  );
$$;

-- profiles ---------------------------------------------------------------

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: owner reads own customers"
  on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.appointments a
      where a.customer_id = profiles.id and public.is_business_owner(a.business_id)
    )
  );

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- RLS filtra linhas, não colunas; isto impede o usuário de trocar o próprio role
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- businesses -------------------------------------------------------------

create policy "businesses: public read"
  on public.businesses for select to anon, authenticated
  using (true);

create policy "businesses: owner creates"
  on public.businesses for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'owner'
    )
  );

create policy "businesses: owner updates"
  on public.businesses for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "businesses: owner deletes"
  on public.businesses for delete to authenticated
  using (owner_id = (select auth.uid()));

-- services ---------------------------------------------------------------

create policy "services: public reads active"
  on public.services for select to anon, authenticated
  using (active or public.is_business_owner(business_id));

create policy "services: owner manages"
  on public.services for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- working_hours ----------------------------------------------------------

create policy "working_hours: public read"
  on public.working_hours for select to anon, authenticated
  using (true);

create policy "working_hours: owner manages"
  on public.working_hours for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- time_off ---------------------------------------------------------------

-- O motivo da folga é privado; a disponibilidade pública virá da RPC
create policy "time_off: owner manages"
  on public.time_off for all to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

-- appointments -----------------------------------------------------------

create policy "appointments: customer or owner reads"
  on public.appointments for select to authenticated
  using (customer_id = (select auth.uid()) or public.is_business_owner(business_id));

create policy "appointments: owner updates"
  on public.appointments for update to authenticated
  using (public.is_business_owner(business_id))
  with check (public.is_business_owner(business_id));

create policy "appointments: customer cancels own"
  on public.appointments for update to authenticated
  using (customer_id = (select auth.uid()) and status in ('pending', 'confirmed'))
  with check (customer_id = (select auth.uid()) and status = 'cancelled');

-- Horário e serviço não mudam por update; criação só pela RPC book_appointment
revoke insert, update, delete on public.appointments from anon, authenticated;
grant update (status, notes) on public.appointments to authenticated;
