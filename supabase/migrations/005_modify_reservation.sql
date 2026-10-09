create or replace function public.modify_reservation_with_token(
  p_public_code text,
  p_token_hash text,
  p_party_size integer,
  p_local_date date,
  p_local_time time
)
returns table (starts_at timestamptz, ends_at timestamptz, party_size integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
  v_settings public.restaurant_settings%rowtype;
  v_hours public.service_hours%rowtype;
  v_unit public.reservable_units%rowtype;
  v_local_start timestamp;
  v_local_close timestamp;
  v_start timestamptz;
  v_end timestamptz;
begin
  select * into v_reservation from public.reservations
  where public_code = upper(p_public_code) and manage_token_hash = p_token_hash
  for update;
  if not found then raise exception using errcode = 'P0002', message = 'reservation_not_found'; end if;
  if v_reservation.status <> 'confirmed' then raise exception using errcode = 'P0001', message = 'not_modifiable'; end if;

  select * into v_settings from public.restaurant_settings where id = true;
  if now() > v_reservation.starts_at - make_interval(mins => v_settings.modification_cutoff_minutes) then
    raise exception using errcode = 'P0001', message = 'modification_cutoff';
  end if;
  if p_party_size < 1 or p_party_size >= v_settings.large_party_threshold then
    raise exception using errcode = '22023', message = 'large_party';
  end if;

  v_local_start := p_local_date + p_local_time;
  v_start := v_local_start at time zone v_settings.timezone;
  v_end := v_start + make_interval(mins => v_settings.seating_minutes);
  select * into v_hours from public.service_hours where weekday = extract(dow from v_local_start)::integer;
  if not found or v_hours.is_closed or p_local_time < v_hours.opens_at then raise exception using errcode = '22023', message = 'outside_service_hours'; end if;
  v_local_close := p_local_date + v_hours.closes_at;
  if v_hours.closes_at <= v_hours.opens_at then v_local_close := v_local_close + interval '1 day'; end if;
  if v_local_start + make_interval(mins => v_settings.seating_minutes) > v_local_close then raise exception using errcode = '22023', message = 'outside_service_hours'; end if;
  if extract(minute from p_local_time)::integer % v_settings.slot_minutes <> 0 then raise exception using errcode = '22023', message = 'invalid_slot'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_local_date::text || ':' || p_local_time::text, 0));
  select unit.* into v_unit from public.reservable_units unit
  where unit.active and unit.capacity >= p_party_size
    and not exists (
      select 1 from public.reservations reservation
      join public.reservation_tables assignment on assignment.reservation_id = reservation.id
      where reservation.status = 'confirmed' and reservation.id <> v_reservation.id
        and reservation.starts_at < v_end and reservation.ends_at > v_start
        and assignment.table_id = any(unit.table_ids)
    )
  order by unit.capacity, cardinality(unit.table_ids) limit 1;
  if not found then raise exception using errcode = 'P0001', message = 'no_availability'; end if;

  delete from public.reservation_tables where reservation_id = v_reservation.id;
  insert into public.reservation_tables (reservation_id,table_id) select v_reservation.id,unnest(v_unit.table_ids);
  update public.reservations set starts_at=v_start,ends_at=v_end,party_size=p_party_size,updated_at=now(),
    contact_delete_after=v_end+make_interval(days=>v_settings.contact_retention_days),
    notes_delete_after=v_end+make_interval(hours=>v_settings.sensitive_notes_retention_hours),
    reminder_24h_sent_at=null,reminder_1h_sent_at=null
  where id=v_reservation.id;
  return query select v_start,v_end,p_party_size;
end;
$$;

revoke all on function public.modify_reservation_with_token(text,text,integer,date,time) from public, anon, authenticated;
grant execute on function public.modify_reservation_with_token(text,text,integer,date,time) to service_role;
