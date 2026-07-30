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
