-- Regular per-horse feed plan, edited by admin and visible to the owner.
alter table horses
  add column feed_morning text,
  add column feed_evening text,
  add column feed_extras text;

-- Unread message counts per conversation for the current user.
-- Admin: messages from the owner not yet read. Owner: messages from the
-- stable (anyone but themselves) in their own conversation not yet read.
create or replace function public.unread_message_counts()
returns table (conversation_id uuid, unread bigint)
language sql
stable
security definer
set search_path = public
as $$
  select m.conversation_id, count(*)
  from conversation_messages m
  join conversations c on c.id = m.conversation_id
  where m.read_at is null
    and (
      (is_admin() and m.sender_id = c.owner_id)
      or (not is_admin() and c.owner_id = auth.uid() and m.sender_id <> auth.uid())
    )
  group by m.conversation_id;
$$;

-- Mark the other side's messages in a conversation as read.
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update conversation_messages m
  set read_at = now()
  from conversations c
  where c.id = m.conversation_id
    and m.conversation_id = p_conversation_id
    and m.read_at is null
    and (
      (is_admin() and m.sender_id = c.owner_id)
      or (not is_admin() and c.owner_id = auth.uid() and m.sender_id <> auth.uid())
    );
$$;

grant execute on function public.unread_message_counts() to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
