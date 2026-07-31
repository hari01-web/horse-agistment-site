-- Admin needs to update contact_submissions to mark messages handled/unhandled.
create policy "contact_submissions_update_admin" on contact_submissions for update
  using (is_admin());
