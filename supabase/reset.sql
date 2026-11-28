-- Zera os dados mantendo apenas dono@agendei.dev e cliente@agendei.dev. Rodar no SQL Editor.
do $$
declare
  v_keep uuid[];
begin
  select array_agg(id) into v_keep
  from auth.users
  where email in ('dono@agendei.dev', 'cliente@agendei.dev');

  -- Evita apagar todo mundo se algum dos usuários mantidos não existir
  if coalesce(array_length(v_keep, 1), 0) <> 2 then
    raise exception 'dono@agendei.dev e cliente@agendei.dev precisam existir antes do reset';
  end if;

  -- O cascade de businesses remove serviços, expediente, folgas e agendamentos
  delete from public.businesses;

  -- O cascade de auth.users remove profiles, identities e sessões
  delete from auth.users where id <> all (v_keep);

  update public.profiles set role = 'owner' where id = (
    select id from auth.users where email = 'dono@agendei.dev'
  );
  update public.profiles set role = 'customer' where id = (
    select id from auth.users where email = 'cliente@agendei.dev'
  );

  raise notice 'Reset concluído: restam % usuários', (select count(*) from auth.users);
end $$;
