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
do $$ begin
 if to_regclass('public.media_assets') is not null then
  revoke all on public.media_assets,public.site_drafts,public.site_publications,public.post_revisions,public.site_revisions from anon,authenticated;
  grant select on public.media_assets,public.site_publications to anon,authenticated;
  grant insert,update,delete on public.media_assets,public.site_drafts,public.site_publications to authenticated;
  grant select on public.site_drafts,public.post_revisions,public.site_revisions to authenticated;
  grant insert on public.post_revisions,public.site_revisions to authenticated;
  revoke all on function public.capture_post_revision(),public.check_media_references(),public.protect_used_media(),public.claim_media_job(uuid),public.save_site_document(jsonb,uuid[],integer,boolean) from public,anon,authenticated;
  grant execute on function public.claim_media_job(uuid),public.save_site_document(jsonb,uuid[],integer,boolean) to authenticated;
 end if;
end $$;
