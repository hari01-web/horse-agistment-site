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
