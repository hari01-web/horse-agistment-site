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
