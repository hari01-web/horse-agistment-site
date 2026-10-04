-- =====================================================================
-- Staff role: helpers who see day-to-day care (horses, feeding, care
-- schedule, paddocks, injuries) but not owners' details, messages,
-- bookings admin, billing or settings.
-- =====================================================================
alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'staff', 'owner'));

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

create policy "horses_select_staff" on horses for select using (is_staff());
create policy "horse_updates_select_staff" on horse_updates for select using (is_staff());
create policy "horse_updates_insert_staff" on horse_updates for insert
  with check (is_staff() and author_id = auth.uid());
create policy "injury_reports_select_staff" on injury_reports for select using (is_staff());
create policy "injury_reports_insert_staff" on injury_reports for insert
  with check (is_staff() and reported_by = auth.uid());
create policy "injury_reports_update_staff" on injury_reports for update using (is_staff());
create policy "injury_report_notes_select_staff" on injury_report_notes for select using (is_staff());
create policy "injury_report_notes_insert_staff" on injury_report_notes for insert
  with check (is_staff() and author_id = auth.uid());
create policy "paddock_logs_insert_staff" on paddock_logs for insert
  with check (is_staff() and author_id = auth.uid());
create policy "care_requests_select_staff" on care_requests for select using (is_staff());
create policy "horse_photos_staff_insert" on storage.objects for insert
  with check (bucket_id = 'horse-photos' and is_staff());

-- Admin changes someone's role (owner / staff / admin). Admins can't
-- change their own role, so there's always at least one admin.
create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You can''t change your own role';
  end if;
  if p_role not in ('admin', 'staff', 'owner') then
    raise exception 'Unknown role';
  end if;
  update profiles set role = p_role where id = p_user_id;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;

-- =====================================================================
-- Extras billing: a price for each kind of extra, and charges per owner.
-- =====================================================================
create table extra_prices (
  type text primary key check (type in ('feed', 'rug', 'other')),
  label text not null,
  price numeric(10, 2) check (price >= 0)
);
insert into extra_prices (type, label) values
  ('feed', 'Feed change'),
  ('rug', 'Rug change'),
  ('other', 'Other (e.g. holding for farrier/vet/dental)');

alter table extra_prices enable row level security;
create policy "extra_prices_select" on extra_prices for select
  using (auth.uid() is not null);
create policy "extra_prices_update_admin" on extra_prices for update
  using (is_admin());

create table charges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  horse_id uuid references horses(id) on delete set null,
  care_request_id uuid unique references care_requests(id) on delete set null,
  description text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  charge_date date not null default (now() at time zone 'Australia/Brisbane')::date,
  created_at timestamptz not null default now()
);

alter table charges enable row level security;
create policy "charges_select" on charges for select
  using (owner_id = auth.uid() or is_admin());
create policy "charges_insert_admin" on charges for insert with check (is_admin());
create policy "charges_update_admin" on charges for update using (is_admin());
create policy "charges_delete_admin" on charges for delete using (is_admin());

-- =====================================================================
-- Vacancies (shown on the public site) and the waiting list.
-- =====================================================================
create table site_settings (
  id int primary key default 1 check (id = 1),
  vacancy_status text not null default 'available'
    check (vacancy_status in ('available', 'limited', 'full')),
  vacancy_note text
);
insert into site_settings (id) values (1);

alter table site_settings enable row level security;
create policy "site_settings_select_public" on site_settings for select using (true);
create policy "site_settings_update_admin" on site_settings for update using (is_admin());

create table waiting_list (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  horse_count int not null default 1 check (horse_count between 1 and 20),
  message text,
  status text not null default 'waiting'
    check (status in ('waiting', 'contacted', 'placed', 'removed')),
  created_at timestamptz not null default now()
);

alter table waiting_list enable row level security;
create policy "waiting_list_insert_public" on waiting_list for insert
  with check (status = 'waiting');
create policy "waiting_list_select_admin" on waiting_list for select using (is_admin());
create policy "waiting_list_update_admin" on waiting_list for update using (is_admin());

-- =====================================================================
-- Gallery: photos admin uploads for the public Gallery page.
-- =====================================================================
create table gallery_photos (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_photos enable row level security;
create policy "gallery_photos_select_public" on gallery_photos for select using (true);
create policy "gallery_photos_insert_admin" on gallery_photos for insert with check (is_admin());
create policy "gallery_photos_update_admin" on gallery_photos for update using (is_admin());
create policy "gallery_photos_delete_admin" on gallery_photos for delete using (is_admin());

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery_public_read" on storage.objects for select
  using (bucket_id = 'gallery');
create policy "gallery_admin_insert" on storage.objects for insert
  with check (bucket_id = 'gallery' and is_admin());
create policy "gallery_admin_delete" on storage.objects for delete
  using (bucket_id = 'gallery' and is_admin());
