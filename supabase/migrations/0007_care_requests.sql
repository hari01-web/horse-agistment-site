-- Last-minute plan-change requests from owners (feed/rug/other), separate
-- from the regular weekly rate and billed as extras.
create table care_requests (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references horses(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('feed', 'rug', 'other')),
  body text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table care_requests enable row level security;

create policy "care_requests_select" on care_requests for select
  using (owner_id = auth.uid() or is_admin());
create policy "care_requests_insert" on care_requests for insert
  with check (owner_id = auth.uid());
create policy "care_requests_update_admin" on care_requests for update
  using (is_admin());
