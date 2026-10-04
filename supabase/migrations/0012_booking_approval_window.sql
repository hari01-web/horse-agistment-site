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
