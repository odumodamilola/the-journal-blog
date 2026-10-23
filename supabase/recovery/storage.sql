-- Replacement project only: run after restoring public tables and application grants.
-- Apply the two policy definitions once; they are deliberately not replaced on a live project.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('journal-media','journal-media',false,20971520,array['image/jpeg','image/png','image/webp','image/avif']) on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy journal_media_owner on storage.objects for all to authenticated
 using (bucket_id='journal-media' and exists(select 1 from public.media_assets a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid())) and exists(select 1 from public.admin_users where user_id=(select auth.uid())))
 with check (bucket_id='journal-media' and exists(select 1 from public.media_assets a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid()) and a.deleted_at is null) and exists(select 1 from public.admin_users where user_id=(select auth.uid())));
create policy journal_media_published on storage.objects for select to anon,authenticated
 using (bucket_id='journal-media' and exists (
 select 1 from public.media_assets a, jsonb_array_elements(a.variants) v
 where a.id::text=(storage.foldername(name))[1] and a.status='ready' and a.deleted_at is null and v->>'path'=name
 and (exists(select 1 from public.posts p where p.status='published' and a.id=any(p.media_ids)) or exists(select 1 from public.site_publications s where a.id=any(s.media_ids)))
 ));
