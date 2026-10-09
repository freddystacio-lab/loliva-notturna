create or replace function public.cancel_reservation_with_token(p_public_code text, p_token_hash text)
returns table (cancelled boolean, starts_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
  v_cutoff integer;
begin
  select * into v_reservation from public.reservations
  where public_code = upper(p_public_code) and manage_token_hash = p_token_hash
  for update;
  if not found then raise exception using errcode = 'P0002', message = 'reservation_not_found'; end if;
  if v_reservation.status <> 'confirmed' then return query select false, v_reservation.starts_at; return; end if;

  select cancellation_cutoff_minutes into v_cutoff from public.restaurant_settings where id = true;
  if now() > v_reservation.starts_at - make_interval(mins => v_cutoff) then
    raise exception using errcode = 'P0001', message = 'cancellation_cutoff';
  end if;

  update public.reservations set status = 'cancelled', updated_at = now() where id = v_reservation.id;
  insert into public.analytics_events (event_name, locale, properties)
  values ('reservation_cancelled', v_reservation.locale, jsonb_build_object('party_size', v_reservation.party_size));
  return query select true, v_reservation.starts_at;
end;
$$;

revoke all on function public.cancel_reservation_with_token(text,text) from public, anon, authenticated;
grant execute on function public.cancel_reservation_with_token(text,text) to service_role;
