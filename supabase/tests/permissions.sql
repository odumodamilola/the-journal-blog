-- Run as postgres through Supabase SQL Editor or MCP. All fixtures roll back.
begin;
insert into auth.users(id) values ('00000000-0000-4000-8000-00000000a001'), ('00000000-0000-4000-8000-00000000a002');
insert into public.admin_users(user_id) select '00000000-0000-4000-8000-00000000a001' where not exists (select 1 from public.admin_users);
select set_config('journal.test_admin', (select user_id::text from public.admin_users), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('journal.test_admin'), 'role', 'authenticated')::text, true);
set local role authenticated;
insert into public.posts(id, author_id, slug, title, content, status) values
  ('00000000-0000-4000-8000-00000000b001', auth.uid(), 'rls-test-private-story', 'Private fixture', 'Private body', 'draft'),
  ('00000000-0000-4000-8000-00000000b002', auth.uid(), 'rls-test-public-story', 'Public fixture', 'Public body', 'published');
do $$ begin
  if (select count(*) from public.posts where id in ('00000000-0000-4000-8000-00000000b001', '00000000-0000-4000-8000-00000000b002')) <> 2 then raise exception 'Admin cannot read drafts'; end if;
  if (select published_at from public.posts where id='00000000-0000-4000-8000-00000000b002') is null then raise exception 'Missing publication timestamp'; end if;
  begin update public.posts set slug='changed-public-url' where id='00000000-0000-4000-8000-00000000b002'; raise exception 'Published URL was mutable'; exception when check_violation then null; end;
  begin insert into public.posts(author_id,slug,status) values (auth.uid(),'rls-invalid-publish','published'); raise exception 'Empty publication accepted'; exception when check_violation then null; end;
end $$;
update public.posts set title='Edited private fixture' where id='00000000-0000-4000-8000-00000000b001' and version=1;
do $$ begin if (select version from public.posts where id='00000000-0000-4000-8000-00000000b001') <> 2 then raise exception 'Version did not increase'; end if; end $$;
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
do $$ begin
  if exists(select 1 from public.posts where id='00000000-0000-4000-8000-00000000b001') then raise exception 'Anonymous reader saw a draft'; end if;
  if not exists(select 1 from public.posts where id='00000000-0000-4000-8000-00000000b002') then raise exception 'Anonymous reader cannot read publication'; end if;
  begin insert into public.posts(author_id,slug) values ('00000000-0000-4000-8000-00000000a002','anonymous-write'); raise exception 'Anonymous write succeeded'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000a002","role":"authenticated"}', true);
set local role authenticated;
do $$ declare affected integer; begin
  if exists(select 1 from public.posts where id='00000000-0000-4000-8000-00000000b001') then raise exception 'Non-admin saw a draft'; end if;
  begin insert into public.posts(author_id,slug) values (auth.uid(),'non-admin-write'); raise exception 'Non-admin write succeeded'; exception when insufficient_privilege then null; end;
  update public.posts set title='Attacker' where id='00000000-0000-4000-8000-00000000b002'; get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Non-admin modified a publication'; end if;
  delete from public.posts where id='00000000-0000-4000-8000-00000000b002'; get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Non-admin deleted a publication'; end if;
  begin insert into public.admin_users(user_id) values (auth.uid()); raise exception 'Admin escalation succeeded'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('journal.test_admin'), 'role', 'authenticated')::text, true);
set local role authenticated;
delete from public.posts where id in ('00000000-0000-4000-8000-00000000b001', '00000000-0000-4000-8000-00000000b002');
do $$ begin if exists(select 1 from public.posts where id in ('00000000-0000-4000-8000-00000000b001', '00000000-0000-4000-8000-00000000b002')) then raise exception 'Admin delete failed'; end if; end $$;
reset role;
rollback;
select 'PASS: admin CRUD, publication lifecycle, anonymous and non-admin isolation; fixtures rolled back' as result;
