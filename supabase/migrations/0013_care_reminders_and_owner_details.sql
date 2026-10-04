-- Care reminders: how often each kind of care is due, editable by admin.
create table care_intervals (
  id int primary key default 1 check (id = 1),
  trim_weeks int not null default 6 check (trim_weeks > 0),
  dental_months int not null default 12 check (dental_months > 0),
  vaccination_months int not null default 12 check (vaccination_months > 0),
  worming_months int not null default 3 check (worming_months > 0),
  warn_days int not null default 7 check (warn_days >= 0)
);
insert into care_intervals (id) values (1);

alter table care_intervals enable row level security;
create policy "care_intervals_select" on care_intervals for select
  using (auth.uid() is not null);
create policy "care_intervals_update_admin" on care_intervals for update
  using (is_admin());

alter table horses
  add column last_vaccination_date date,
  add column last_worming_date date;

-- Owners can update their own name and phone (but never their role).
revoke update on profiles from authenticated;
grant update (full_name, phone) on profiles to authenticated;
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Owners can update the emergency contact on their own horses only.
create or replace function public.update_my_horse_emergency_contact(
  p_horse_id uuid,
  p_name text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update horses
  set emergency_contact_name = nullif(trim(p_name), ''),
      emergency_contact_phone = nullif(trim(p_phone), ''),
      updated_at = now()
  where id = p_horse_id and owner_id = auth.uid();

  if not found then
    raise exception 'Horse not found';
  end if;
end;
$$;

grant execute on function public.update_my_horse_emergency_contact(uuid, text, text) to authenticated;
