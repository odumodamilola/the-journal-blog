-- Hosted projects may grant new public tables to API roles by default.
-- RLS is mandatory, and table-level grants should also be least-privilege.
revoke all on public.media_assets,public.site_drafts,public.site_publications,public.post_revisions,public.site_revisions from anon,authenticated;
grant select on public.media_assets,public.site_publications to anon,authenticated;
grant insert,update,delete on public.media_assets,public.site_drafts,public.site_publications to authenticated;
grant select on public.site_drafts,public.post_revisions,public.site_revisions to authenticated;
grant insert on public.post_revisions,public.site_revisions to authenticated;
