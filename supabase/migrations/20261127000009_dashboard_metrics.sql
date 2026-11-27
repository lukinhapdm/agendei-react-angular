-- Agrega as métricas no banco: uma chamada leve em vez de baixar todos os agendamentos
create function public.get_dashboard_metrics(p_business_id uuid)
returns jsonb
language sql
stable
-- invoker: o RLS de appointments garante que só o dono enxerga os números
security invoker
set search_path = ''
as $$
  with biz as (
    select timezone as tz, (now() at time zone timezone)::date as today
    from public.businesses
    where id = p_business_id
  ),
  appts as (
    select
      a.status,
      s.name as service_name,
      s.price_cents,
      (a.starts_at at time zone biz.tz)::date as local_date
    from public.appointments a
    join public.services s on s.id = a.service_id
    cross join biz
    where a.business_id = p_business_id
  ),
  active as (
    select * from appts where status in ('pending', 'confirmed', 'completed')
  )
  select jsonb_build_object(
    'today_count',
      (select count(*) from active, biz where local_date = biz.today and status <> 'completed'),
    'next_7_days_count',
      (select count(*) from active, biz
        where local_date between biz.today and biz.today + 6 and status <> 'completed'),
    'month_revenue_cents',
      (select coalesce(sum(price_cents), 0) from active, biz
        where status = 'completed' and date_trunc('month', local_date) = date_trunc('month', biz.today)),
    'month_expected_cents',
      (select coalesce(sum(price_cents), 0) from active, biz
        where date_trunc('month', local_date) = date_trunc('month', biz.today)),
    'cancellation_rate_30d',
      (select round(count(*) filter (where status = 'cancelled')::numeric / nullif(count(*), 0), 3)
        from appts, biz where local_date between biz.today - 29 and biz.today),
    'daily_next_14_days',
      (select jsonb_agg(jsonb_build_object('date', d::date, 'count', coalesce(c.count, 0)) order by d)
        from biz,
          generate_series(biz.today, biz.today + 13, interval '1 day') d
          left join lateral (
            select count(*) from active where local_date = d::date and status <> 'completed'
          ) c on true),
    'top_services_30d',
      (select coalesce(jsonb_agg(t order by t.count desc), '[]'::jsonb)
        from (
          select service_name as name, count(*) as count
          from active, biz
          where local_date between biz.today - 29 and biz.today + 30
          group by service_name
          order by count(*) desc
          limit 5
        ) t)
  )
  from biz;
$$;

revoke execute on function public.get_dashboard_metrics(uuid) from public, anon;
grant execute on function public.get_dashboard_metrics(uuid) to authenticated;
