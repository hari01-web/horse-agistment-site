-- Full database setup for a NEW Supabase project.
-- Generated from supabase/migrations. Paste the whole file into
-- Supabase > SQL Editor > New query, and click Run. Only run it once.

-- ===== 0001_init.sql =====
-- Core schema for Strathyre Park: profiles, horses, bookings, messaging, contact form.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'owner' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);

create table horses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  breed text,
  dob date,
  photo_url text,
  status text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table horse_updates (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references horses(id) on delete cascade,
  author_id uuid not null references profiles(id),
  type text not null check (type in ('health', 'feeding', 'general', 'photo')),
  body text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table booking_settings (
  id int primary key default 1 check (id = 1),
  slot_duration_minutes int not null default 60,
  open_time time not null default '09:00',
  close_time time not null default '17:00',
  days_open int[] not null default '{0,1,2,3,4,5,6}',
  capacity_per_slot int not null default 1
);

insert into booking_settings (id) values (1);

create table blackout_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references profiles(id) on delete cascade,
  horse_id uuid references horses(id) on delete set null,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

-- Auto-create a profile row (default role 'owner') whenever someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'owner');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== 0002_rls_policies.sql =====
-- Row Level Security: owners see only their own data, admin sees everything.

alter table profiles enable row level security;
alter table horses enable row level security;
alter table horse_updates enable row level security;
alter table booking_settings enable row level security;
alter table blackout_dates enable row level security;
alter table bookings enable row level security;
alter table conversations enable row level security;
alter table conversation_messages enable row level security;
alter table contact_submissions enable row level security;

-- security definer helper avoids RLS self-recursion when checking role
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or is_admin());

-- horses
create policy "horses_select" on horses for select
  using (owner_id = auth.uid() or is_admin());
create policy "horses_insert_admin" on horses for insert
  with check (is_admin());
create policy "horses_update_admin" on horses for update
  using (is_admin());
create policy "horses_delete_admin" on horses for delete
  using (is_admin());

-- horse_updates
create policy "horse_updates_select" on horse_updates for select
  using (
    is_admin() or exists (
      select 1 from horses h where h.id = horse_updates.horse_id and h.owner_id = auth.uid()
    )
  );
create policy "horse_updates_insert_admin" on horse_updates for insert
  with check (is_admin());

-- booking_settings: any signed-in user can read (needed to compute available slots)
create policy "booking_settings_select" on booking_settings for select
  using (auth.uid() is not null);
create policy "booking_settings_update_admin" on booking_settings for update
  using (is_admin());

-- blackout_dates
create policy "blackout_dates_select" on blackout_dates for select
  using (auth.uid() is not null);
create policy "blackout_dates_insert_admin" on blackout_dates for insert
  with check (is_admin());
create policy "blackout_dates_update_admin" on blackout_dates for update
  using (is_admin());
create policy "blackout_dates_delete_admin" on blackout_dates for delete
  using (is_admin());

-- bookings
create policy "bookings_select" on bookings for select
  using (rider_id = auth.uid() or is_admin());
create policy "bookings_insert" on bookings for insert
  with check (rider_id = auth.uid() or is_admin());
create policy "bookings_update" on bookings for update
  using (rider_id = auth.uid() or is_admin());

-- conversations
create policy "conversations_select" on conversations for select
  using (owner_id = auth.uid() or is_admin());
create policy "conversations_insert" on conversations for insert
  with check (owner_id = auth.uid() or is_admin());

-- conversation_messages
create policy "conversation_messages_select" on conversation_messages for select
  using (
    is_admin() or exists (
      select 1 from conversations c
      where c.id = conversation_messages.conversation_id and c.owner_id = auth.uid()
    )
  );
create policy "conversation_messages_insert" on conversation_messages for insert
  with check (
    sender_id = auth.uid() and (
      is_admin() or exists (
        select 1 from conversations c
        where c.id = conversation_messages.conversation_id and c.owner_id = auth.uid()
      )
    )
  );

-- contact_submissions: public can submit, only admin can read
create policy "contact_submissions_insert_public" on contact_submissions for insert
  with check (true);
create policy "contact_submissions_select_admin" on contact_submissions for select
  using (is_admin());

-- ===== 0003_contact_submissions_update.sql =====
-- Admin needs to update contact_submissions to mark messages handled/unhandled.
create policy "contact_submissions_update_admin" on contact_submissions for update
  using (is_admin());

-- ===== 0004_profiles_email_and_storage.sql =====
-- Store email on profiles so admin can look up/assign owners without needing
-- direct access to auth.users.
alter table profiles add column email text;

update profiles p set email = u.email from auth.users u where u.id = p.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'owner', new.email);
  return new;
end;
$$;

-- Storage bucket for horse photos: publicly readable, admin-only writes.
insert into storage.buckets (id, name, public)
values ('horse-photos', 'horse-photos', true)
on conflict (id) do nothing;

create policy "horse_photos_public_read" on storage.objects for select
  using (bucket_id = 'horse-photos');

create policy "horse_photos_admin_insert" on storage.objects for insert
  with check (bucket_id = 'horse-photos' and is_admin());

create policy "horse_photos_admin_update" on storage.objects for update
  using (bucket_id = 'horse-photos' and is_admin());

create policy "horse_photos_admin_delete" on storage.objects for delete
  using (bucket_id = 'horse-photos' and is_admin());

-- ===== 0005_horse_details.sql =====
-- Expand horse records with care-team, care-date, and emergency contact info.
-- Replaces the full date of birth with just a birth year, per business need.
alter table horses
  drop column dob,
  add column birth_year int,
  add column vet_name text,
  add column vet_phone text,
  add column farrier_name text,
  add column farrier_phone text,
  add column last_trim_date date,
  add column last_dental_date date,
  add column dental_provider text,
  add column emergency_contact_name text,
  add column emergency_contact_phone text;

-- ===== 0006_book_slot.sql =====
-- Atomic booking function: checks opening hours, blackout dates, and slot
-- capacity, then inserts, all within one transaction. An advisory lock keyed
-- on the slot start time serializes concurrent booking attempts for the same
-- slot so two riders can't both slip past the capacity check at once.
create or replace function public.book_slot(p_slot_start timestamptz, p_horse_id uuid default null)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings booking_settings%rowtype;
  v_slot_end timestamptz;
  v_count int;
  v_booking bookings;
  v_dow int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_settings from booking_settings where id = 1;
  v_slot_end := p_slot_start + (v_settings.slot_duration_minutes || ' minutes')::interval;

  v_dow := extract(dow from p_slot_start at time zone 'utc');
  if not (v_dow = any(v_settings.days_open)) then
    raise exception 'Selected day is not open for bookings';
  end if;

  if (p_slot_start at time zone 'utc')::time < v_settings.open_time
     or (p_slot_start at time zone 'utc')::time >= v_settings.close_time then
    raise exception 'Selected time is outside opening hours';
  end if;

  if exists (
    select 1 from blackout_dates where date = (p_slot_start at time zone 'utc')::date
  ) then
    raise exception 'Selected date is unavailable';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_slot_start::text));

  select count(*) into v_count from bookings
    where slot_start = p_slot_start and status = 'confirmed';

  if v_count >= v_settings.capacity_per_slot then
    raise exception 'This time slot is fully booked';
  end if;

  insert into bookings (rider_id, horse_id, slot_start, slot_end, status)
  values (auth.uid(), p_horse_id, p_slot_start, v_slot_end, 'confirmed')
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.book_slot(timestamptz, uuid) to authenticated;

-- ===== 0007_care_requests.sql =====
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

-- ===== 0008_paddocks.sql =====
-- Paddocks (grazing/holding areas) and maintenance logs (irrigation, slashing),
-- based on the property layout: paddocks 1-16 plus the cow paddock.
create table paddocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  has_shelter boolean not null default false,
  row_position int not null,
  col_position int not null,
  notes text,
  created_at timestamptz not null default now()
);

create table paddock_logs (
  id uuid primary key default gen_random_uuid(),
  paddock_id uuid not null references paddocks(id) on delete cascade,
  type text not null check (type in ('irrigation', 'slashing', 'other')),
  notes text,
  performed_at date not null default current_date,
  author_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table horses add column paddock_id uuid references paddocks(id) on delete set null;

alter table paddocks enable row level security;
alter table paddock_logs enable row level security;

-- Any signed-in user (owner or admin) can view paddocks/logs so owners have
-- context on their horse's paddock; only admin manages them.
create policy "paddocks_select" on paddocks for select
  using (auth.uid() is not null);
create policy "paddocks_insert_admin" on paddocks for insert
  with check (is_admin());
create policy "paddocks_update_admin" on paddocks for update
  using (is_admin());

create policy "paddock_logs_select" on paddock_logs for select
  using (auth.uid() is not null);
create policy "paddock_logs_insert_admin" on paddock_logs for insert
  with check (is_admin());

-- Seed the real paddock layout (schematic, three rows matching the property plan).
insert into paddocks (name, row_position, col_position) values
  ('Paddock 11', 1, 1), ('Paddock 10', 1, 2), ('Paddock 9', 1, 3),
  ('Paddock 8', 2, 1), ('Paddock 7', 2, 2), ('Paddock 6', 2, 3), ('Paddock 5', 2, 4),
  ('Paddock 4', 2, 5), ('Paddock 3', 2, 6), ('Paddock 2', 2, 7), ('Paddock 1', 2, 8),
  ('Paddock 16', 3, 1), ('Paddock 15', 3, 2), ('Paddock 14', 3, 3), ('Paddock 13', 3, 4), ('Paddock 12', 3, 5),
  ('Cow Paddock', 4, 1);

-- ===== 0009_injury_reports.sql =====
-- Injury tracking: a report stays open across multiple photo/note check-ins
-- until marked resolved, unlike the one-off horse_updates timeline.
create table injury_reports (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references horses(id) on delete cascade,
  reported_by uuid not null references profiles(id),
  title text not null,
  status text not null default 'open' check (status in ('open', 'healing', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table injury_report_notes (
  id uuid primary key default gen_random_uuid(),
  injury_report_id uuid not null references injury_reports(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table injury_reports enable row level security;
alter table injury_report_notes enable row level security;

create policy "injury_reports_select" on injury_reports for select
  using (
    is_admin() or exists (
      select 1 from horses h where h.id = injury_reports.horse_id and h.owner_id = auth.uid()
    )
  );
create policy "injury_reports_insert_admin" on injury_reports for insert
  with check (is_admin());
create policy "injury_reports_update_admin" on injury_reports for update
  using (is_admin());

create policy "injury_report_notes_select" on injury_report_notes for select
  using (
    is_admin() or exists (
      select 1 from injury_reports r
      join horses h on h.id = r.horse_id
      where r.id = injury_report_notes.injury_report_id and h.owner_id = auth.uid()
    )
  );
create policy "injury_report_notes_insert_admin" on injury_report_notes for insert
  with check (is_admin());

-- ===== 0010_security_and_timezone_fixes.sql =====
-- 1. Admin can update profiles (e.g. owner phone numbers). Previously there was
--    no update policy, so phone changes from the horse forms silently failed.
create policy "profiles_update_admin" on profiles for update
  using (is_admin());

-- 2. Bookings may only be created through book_slot(), which enforces opening
--    hours, blackout dates and capacity. Riders may only cancel their own
--    bookings, not move them to another time.
drop policy "bookings_insert" on bookings;
drop policy "bookings_update" on bookings;

revoke update on bookings from authenticated;
grant update (status) on bookings to authenticated;

create policy "bookings_update" on bookings for update
  using (rider_id = auth.uid() or is_admin())
  with check (status = 'cancelled' or is_admin());

-- 3. Owners can only raise care requests for their own horses.
drop policy "care_requests_insert" on care_requests;
create policy "care_requests_insert" on care_requests for insert
  with check (
    owner_id = auth.uid() and exists (
      select 1 from horses h where h.id = care_requests.horse_id and h.owner_id = auth.uid()
    )
  );

-- 4. Rebuild book_slot: opening hours and dates are in Queensland time
--    (Australia/Brisbane) rather than UTC, slots must line up with the slot
--    grid, can't be in the past, and the horse (if given) must be the rider's.
create or replace function public.book_slot(p_slot_start timestamptz, p_horse_id uuid default null)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings booking_settings%rowtype;
  v_local timestamp;
  v_slot_end timestamptz;
  v_count int;
  v_booking bookings;
  v_offset_minutes int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_settings from booking_settings where id = 1;
  v_local := p_slot_start at time zone 'Australia/Brisbane';
  v_slot_end := p_slot_start + (v_settings.slot_duration_minutes || ' minutes')::interval;

  if p_slot_start < now() then
    raise exception 'That time has already passed';
  end if;

  if not (extract(dow from v_local)::int = any(v_settings.days_open)) then
    raise exception 'Selected day is not open for bookings';
  end if;

  if v_local::time < v_settings.open_time or v_local::time >= v_settings.close_time then
    raise exception 'Selected time is outside opening hours';
  end if;

  v_offset_minutes := extract(epoch from (v_local::time - v_settings.open_time))::int / 60;
  if v_offset_minutes % v_settings.slot_duration_minutes <> 0 then
    raise exception 'Selected time is not a valid slot';
  end if;

  if exists (select 1 from blackout_dates where date = v_local::date) then
    raise exception 'Selected date is unavailable';
  end if;

  if p_horse_id is not null and not exists (
    select 1 from horses where id = p_horse_id and (owner_id = auth.uid() or is_admin())
  ) then
    raise exception 'Horse not found';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_slot_start::text));

  select count(*) into v_count from bookings
    where slot_start = p_slot_start and status = 'confirmed';

  if v_count >= v_settings.capacity_per_slot then
    raise exception 'This time slot is fully booked';
  end if;

  insert into bookings (rider_id, horse_id, slot_start, slot_end, status)
  values (auth.uid(), p_horse_id, p_slot_start, v_slot_end, 'confirmed')
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ===== 0011_feed_plans_and_unread_messages.sql =====
-- Regular per-horse feed plan, edited by admin and visible to the owner.
alter table horses
  add column feed_morning text,
  add column feed_evening text,
  add column feed_extras text;

-- Unread message counts per conversation for the current user.
-- Admin: messages from the owner not yet read. Owner: messages from the
-- stable (anyone but themselves) in their own conversation not yet read.
create or replace function public.unread_message_counts()
returns table (conversation_id uuid, unread bigint)
language sql
stable
security definer
set search_path = public
as $$
  select m.conversation_id, count(*)
  from conversation_messages m
  join conversations c on c.id = m.conversation_id
  where m.read_at is null
    and (
      (is_admin() and m.sender_id = c.owner_id)
      or (not is_admin() and c.owner_id = auth.uid() and m.sender_id <> auth.uid())
    )
  group by m.conversation_id;
$$;

-- Mark the other side's messages in a conversation as read.
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update conversation_messages m
  set read_at = now()
  from conversations c
  where c.id = m.conversation_id
    and m.conversation_id = p_conversation_id
    and m.read_at is null
    and (
      (is_admin() and m.sender_id = c.owner_id)
      or (not is_admin() and c.owner_id = auth.uid() and m.sender_id <> auth.uid())
    );
$$;

grant execute on function public.unread_message_counts() to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ===== 0012_booking_approval_window.sql =====
-- Bookings further ahead than advance_booking_days become 'pending' requests
-- that admin approves ('confirmed') or declines ('declined'). Pending
-- requests hold their slot so it can't be double-booked meanwhile.

alter table booking_settings
  add column advance_booking_days int not null default 14
    check (advance_booking_days >= 0);

alter table bookings drop constraint bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('confirmed', 'pending', 'declined', 'cancelled'));

create or replace function public.book_slot(p_slot_start timestamptz, p_horse_id uuid default null)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings booking_settings%rowtype;
  v_local timestamp;
  v_slot_end timestamptz;
  v_count int;
  v_booking bookings;
  v_offset_minutes int;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_settings from booking_settings where id = 1;
  v_local := p_slot_start at time zone 'Australia/Brisbane';
  v_slot_end := p_slot_start + (v_settings.slot_duration_minutes || ' minutes')::interval;

  if p_slot_start < now() then
    raise exception 'That time has already passed';
  end if;

  if not (extract(dow from v_local)::int = any(v_settings.days_open)) then
    raise exception 'Selected day is not open for bookings';
  end if;

  if v_local::time < v_settings.open_time or v_local::time >= v_settings.close_time then
    raise exception 'Selected time is outside opening hours';
  end if;

  v_offset_minutes := extract(epoch from (v_local::time - v_settings.open_time))::int / 60;
  if v_offset_minutes % v_settings.slot_duration_minutes <> 0 then
    raise exception 'Selected time is not a valid slot';
  end if;

  if exists (select 1 from blackout_dates where date = v_local::date) then
    raise exception 'Selected date is unavailable';
  end if;

  if p_horse_id is not null and not exists (
    select 1 from horses where id = p_horse_id and (owner_id = auth.uid() or is_admin())
  ) then
    raise exception 'Horse not found';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_slot_start::text));

  select count(*) into v_count from bookings
    where slot_start = p_slot_start and status in ('confirmed', 'pending');

  if v_count >= v_settings.capacity_per_slot then
    raise exception 'This time slot is fully booked';
  end if;

  -- Within the window: confirmed straight away. Beyond it: needs approval
  -- (admins booking on someone's behalf are confirmed straight away).
  if v_local::date - (now() at time zone 'Australia/Brisbane')::date > v_settings.advance_booking_days
     and not is_admin() then
    v_status := 'pending';
  else
    v_status := 'confirmed';
  end if;

  insert into bookings (rider_id, horse_id, slot_start, slot_end, status)
  values (auth.uid(), p_horse_id, p_slot_start, v_slot_end, v_status)
  returning * into v_booking;

  return v_booking;
end;
$$;

-- How many places are taken in each slot within a time range (confirmed +
-- pending), without revealing who booked. Owners can only read their own
-- bookings, so the booking page needs this to show which slots are full.
create or replace function public.booked_slot_counts(p_from timestamptz, p_to timestamptz)
returns table (slot_start timestamptz, taken bigint)
language sql
stable
security definer
set search_path = public
as $$
  select b.slot_start, count(*)
  from bookings b
  where auth.uid() is not null
    and b.slot_start >= p_from and b.slot_start < p_to
    and b.status in ('confirmed', 'pending')
  group by b.slot_start;
$$;

grant execute on function public.booked_slot_counts(timestamptz, timestamptz) to authenticated;

