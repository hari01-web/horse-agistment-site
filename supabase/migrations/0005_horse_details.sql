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
