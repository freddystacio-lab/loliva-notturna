-- Lista de espera para franjas sin disponibilidad
create table if not exists public.reservation_waitlist (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  party_size integer not null check (party_size between 1 and 30),
  preferred_date date not null,
  preferred_time time not null,
  locale text not null check (locale in ('es','en','it')),
  status text not null default 'pending' check (status in ('pending','contacted','closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reservation_waitlist enable row level security;
create policy "authenticated admins manage waitlist"
on public.reservation_waitlist
for all to authenticated
using (true) with check (true);
