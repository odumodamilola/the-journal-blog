-- Recovery-only: run as postgres AFTER restoring into a separate replacement database.
-- Archives intentionally omit platform-specific ACLs, so restore the app's explicit grants.
grant usage on schema public, auth to anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
revoke all on function public.enforce_post_lifecycle() from public, anon, authenticated;
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
