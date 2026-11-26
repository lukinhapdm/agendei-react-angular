-- Substitui o expediente inteiro numa única transação: ou grava tudo, ou nada
create function public.replace_working_hours(p_business_id uuid, p_hours jsonb)
returns void
language plpgsql
-- invoker: roda com as permissões de quem chamou, então o RLS da 2.5 continua valendo
security invoker
set search_path = ''
as $$
begin
  if not public.is_business_owner(p_business_id) then
    raise exception 'forbidden';
  end if;

  delete from public.working_hours where business_id = p_business_id;

  insert into public.working_hours (business_id, weekday, start_time, end_time)
  select
    p_business_id,
    (h ->> 'weekday')::smallint,
    (h ->> 'start_time')::time,
    (h ->> 'end_time')::time
  from jsonb_array_elements(p_hours) h;
end;
$$;

revoke execute on function public.replace_working_hours(uuid, jsonb) from public, anon;
grant execute on function public.replace_working_hours(uuid, jsonb) to authenticated;
