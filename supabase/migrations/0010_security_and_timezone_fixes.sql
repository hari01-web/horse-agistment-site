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
