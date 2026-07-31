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
