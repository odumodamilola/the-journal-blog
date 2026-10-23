-- A public submission channel, not public access to the editor's inbox.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  subject text not null check (char_length(subject) between 2 and 160),
  message text not null check (char_length(message) between 20 and 5000),
  created_at timestamptz not null default now()
);
create index contact_messages_sender_time on public.contact_messages(email, created_at desc);
create index contact_messages_time on public.contact_messages(created_at desc);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from public, anon, authenticated;
grant insert(full_name,email,subject,message) on public.contact_messages to anon;
grant select on public.contact_messages to authenticated;
create policy contact_guest_submission on public.contact_messages for insert to anon
  with check (char_length(full_name) between 2 and 100 and char_length(message) between 20 and 5000);
create policy contact_editor_read on public.contact_messages for select to authenticated
  using (exists(select 1 from public.admin_users where user_id=(select auth.uid())));

create schema if not exists journal_private;
revoke all on schema journal_private from public, anon, authenticated;
-- Definer is necessary ONLY to count otherwise unreadable submissions. This
-- trigger cannot be invoked as a public RPC and grants no access to messages.
-- It deliberately accepts guest submissions; administrator authorization still
-- protects every SELECT through the separate RLS policy above.
create function journal_private.limit_contact_submissions() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  new.full_name := btrim(new.full_name);
  new.email := lower(btrim(new.email));
  new.subject := btrim(new.subject);
  new.message := btrim(new.message);
  new.created_at := statement_timestamp();
  perform pg_advisory_xact_lock(842710193);
  if (select count(*) from public.contact_messages where created_at > statement_timestamp()-interval '24 hours') >= 100
    or (select count(*) from public.contact_messages where email=new.email and created_at > statement_timestamp()-interval '1 hour') >= 3
  then raise exception 'Contact submission rate limit reached' using errcode='P0001'; end if;
  return new;
end $$;
revoke all on function journal_private.limit_contact_submissions() from public, anon, authenticated;
create trigger contact_submission_limits before insert on public.contact_messages
  for each row execute function journal_private.limit_contact_submissions();
