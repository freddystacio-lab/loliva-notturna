create extension if not exists pgcrypto;

create type public.reservation_status as enum ('confirmed', 'cancelled', 'completed', 'no_show');
create type public.content_status as enum ('draft', 'published');

create table public.restaurant_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'America/Santiago',
  currency text not null default 'CLP',
  slot_minutes integer not null default 30 check (slot_minutes between 15 and 120),
  seating_minutes integer not null default 120 check (seating_minutes between 30 and 360),
  large_party_threshold integer not null default 9 check (large_party_threshold >= 2),
  modification_cutoff_minutes integer not null default 120,
  cancellation_cutoff_minutes integer not null default 60,
  contact_retention_days integer not null default 30,
  sensitive_notes_retention_hours integer not null default 48,
  updated_at timestamptz not null default now()
);

insert into public.restaurant_settings (id) values (true) on conflict do nothing;

create table public.service_hours (
  weekday integer primary key check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false
);

insert into public.service_hours (weekday, opens_at, closes_at, is_closed) values
  (0, '18:00', '00:00', false), (1, null, null, true),
  (2, '18:00', '00:00', false), (3, '18:00', '00:00', false),
  (4, '18:00', '00:00', false), (5, '18:00', '00:00', false),
  (6, '18:00', '00:00', false)
on conflict do nothing;

create table public.dining_tables (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  capacity integer not null check (capacity between 1 and 20),
  active boolean not null default true,
  sort_order integer not null default 0
);

insert into public.dining_tables (code, capacity, sort_order) values
  ('T01', 2, 1), ('T02', 2, 2), ('T03', 2, 3), ('T04', 2, 4),
  ('T05', 4, 5), ('T06', 4, 6), ('T07', 4, 7), ('T08', 4, 8),
  ('T09', 6, 9), ('T10', 6, 10)
on conflict (code) do nothing;

create table public.reservable_units (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  capacity integer not null check (capacity between 1 and 30),
  table_ids uuid[] not null,
  active boolean not null default true,
  check (cardinality(table_ids) > 0)
);

insert into public.reservable_units (name, capacity, table_ids)
select code, capacity, array[id] from public.dining_tables on conflict (name) do nothing;

insert into public.reservable_units (name, capacity, table_ids)
select 'T05 + T06', 8, array_agg(id order by code) from public.dining_tables where code in ('T05','T06')
on conflict (name) do nothing;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  public_code text unique not null default upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8)),
  status public.reservation_status not null default 'confirmed',
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  party_size integer not null check (party_size between 1 and 30),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  locale text not null check (locale in ('es','en','it')),
  occasion text,
  dietary_notes text,
  manage_token_hash text not null,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_delete_after timestamptz not null,
  notes_delete_after timestamptz not null,
  check (ends_at > starts_at)
);

create table public.reservation_tables (
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  table_id uuid not null references public.dining_tables(id),
  primary key (reservation_id, table_id)
);

create index reservations_active_time_idx on public.reservations (starts_at, ends_at)
where status = 'confirmed';

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  locale text check (locale in ('es','en','it')),
  occurred_at timestamptz not null default now(),
  properties jsonb not null default '{}'::jsonb,
  check (event_name in ('page_view','menu_view','menu_pdf_download','qr_scan','availability_search','reservation_created','reservation_rejected','whatsapp_handoff','reservation_cancelled'))
);

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  slug text not null,
  locale text not null check (locale in ('es','en','it')),
  status public.content_status not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (content_type, slug, locale, status)
);

alter table public.restaurant_settings enable row level security;
alter table public.service_hours enable row level security;
alter table public.dining_tables enable row level security;
alter table public.reservable_units enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_tables enable row level security;
alter table public.analytics_events enable row level security;
alter table public.content_entries enable row level security;

create policy "published content is public" on public.content_entries for select using (status = 'published');
create policy "authenticated admins manage content" on public.content_entries for all to authenticated using (true) with check (true);
create policy "authenticated admins manage reservations" on public.reservations for all to authenticated using (true) with check (true);
create policy "authenticated admins view assignments" on public.reservation_tables for select to authenticated using (true);
create policy "authenticated admins manage settings" on public.restaurant_settings for all to authenticated using (true) with check (true);
create policy "authenticated admins manage hours" on public.service_hours for all to authenticated using (true) with check (true);
create policy "authenticated admins manage tables" on public.dining_tables for all to authenticated using (true) with check (true);
create policy "authenticated admins manage units" on public.reservable_units for all to authenticated using (true) with check (true);
create policy "authenticated admins read analytics" on public.analytics_events for select to authenticated using (true);

create or replace function public.purge_expired_personal_data()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.reservations set dietary_notes = null, occasion = null
  where notes_delete_after <= now() and (dietary_notes is not null or occasion is not null);

  update public.reservations set guest_name = 'Anonimizado', guest_email = 'deleted@invalid.local', guest_phone = ''
  where contact_delete_after <= now() and guest_email <> 'deleted@invalid.local';
end;
$$;
