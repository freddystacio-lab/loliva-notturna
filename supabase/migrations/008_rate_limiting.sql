-- Rate limiting distribuido para verificacion de acceso a reservas
create table if not exists public.rate_limit_buckets (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_key is null or p_key = '' or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limit_buckets (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    count = case
      when public.rate_limit_buckets.reset_at <= now() then 1
      else public.rate_limit_buckets.count + 1
    end,
    reset_at = case
      when public.rate_limit_buckets.reset_at <= now() then now() + make_interval(secs => p_window_seconds)
      else public.rate_limit_buckets.reset_at
    end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

alter table public.rate_limit_buckets enable row level security;
-- Sin políticas públicas: solo el service_role consume este contador.
revoke all on table public.rate_limit_buckets from public, anon, authenticated;
revoke all on function public.consume_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;

-- Limpieza de cubetas expiradas dentro del mantenimiento
create or replace function public.purge_expired_personal_data()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.reservations set dietary_notes = null, occasion = null
  where notes_delete_after <= now() and (dietary_notes is not null or occasion is not null);

  update public.reservations set guest_name = 'Anonimizado', guest_email = 'deleted@invalid.local', guest_phone = ''
  where contact_delete_after <= now() and guest_email <> 'deleted@invalid.local';

  delete from public.rate_limit_buckets where reset_at < now() - interval '1 hour';
end;
$$;
