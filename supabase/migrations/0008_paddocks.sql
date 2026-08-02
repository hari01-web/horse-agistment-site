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
