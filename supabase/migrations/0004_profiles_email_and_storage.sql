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
