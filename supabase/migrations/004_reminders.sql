alter table public.reservations
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_1h_sent_at timestamptz;

create index if not exists reservations_pending_reminders_idx
on public.reservations (starts_at)
where status = 'confirmed';
