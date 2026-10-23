-- Additive migration: existing Markdown and published URLs remain unchanged.
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  filename text not null check (length(filename) between 1 and 200),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif')),
  original_bytes integer not null check (original_bytes between 1 and 20971520),
  status text not null default 'uploading' check (status in ('uploading','processing','ready','failed')),
  lease_token uuid,
  width integer check (width between 1 and 3840),
  height integer check (height between 1 and 3840),
  variants jsonb not null default '[]' check (jsonb_typeof(variants) = 'array' and octet_length(variants::text) < 20000),
  alt text not null default '' check (length(alt) <= 300),
  caption text not null default '' check (length(caption) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index media_assets_owner_idx on public.media_assets(owner_id);
alter table public.posts
  add column content_format text not null default 'markdown' check (content_format in ('markdown','rich')),
  add column content_document jsonb check (content_document is null or (jsonb_typeof(content_document) = 'object' and octet_length(content_document::text) <= 200000)),
  add column media_ids uuid[] not null default '{}';
alter table public.posts add constraint posts_rich_document check (content_format <> 'rich' or content_document is not null);

create table public.site_drafts (
  singleton boolean primary key default true check (singleton),
  config jsonb not null default '{}' check (jsonb_typeof(config) = 'object' and octet_length(config::text) <= 100000),
  media_ids uuid[] not null default '{}',
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
create table public.site_publications (
  singleton boolean primary key default true check (singleton),
  config jsonb not null default '{}' check (jsonb_typeof(config) = 'object' and octet_length(config::text) <= 100000),
  media_ids uuid[] not null default '{}',
  version integer not null default 1 check (version > 0),
  published_at timestamptz not null default now()
);
insert into public.site_drafts default values;
insert into public.site_publications default values;
create table public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  version integer not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  unique(post_id, version)
);
create table public.site_revisions (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  config jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.media_assets enable row level security;
alter table public.site_drafts enable row level security;
alter table public.site_publications enable row level security;
alter table public.post_revisions enable row level security;
alter table public.site_revisions enable row level security;
grant select on public.media_assets, public.site_publications to anon, authenticated;
grant insert, update, delete on public.media_assets, public.site_publications to authenticated;
grant select, insert, update, delete on public.site_drafts, public.post_revisions, public.site_revisions to authenticated;

create policy media_owner on public.media_assets for all to authenticated
 using (owner_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
 with check (owner_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy media_published_read on public.media_assets for select to anon, authenticated using (
 status = 'ready' and deleted_at is null and (
 exists (select 1 from public.posts p where p.status = 'published' and media_assets.id = any(p.media_ids))
 or exists (select 1 from public.site_publications s where media_assets.id = any(s.media_ids))));
create policy site_public_read on public.site_publications for select to anon, authenticated using (true);
create policy site_public_admin on public.site_publications for all to authenticated
 using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy site_draft_admin on public.site_drafts for all to authenticated
 using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy post_revision_admin on public.post_revisions for all to authenticated
 using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
 with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = (select auth.uid())) and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy site_revision_admin on public.site_revisions for all to authenticated
 using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
 with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create function public.capture_post_revision() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.post_revisions(post_id,version,data) values(old.id,old.version,to_jsonb(old));
  return new;
end $$;
create trigger capture_post_revision before update on public.posts for each row execute function public.capture_post_revision();

create function public.check_media_references() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if cardinality(new.media_ids) > 100 then raise exception 'Too many media references'; end if;
  if exists (select 1 from unnest(new.media_ids) m where not exists (
    select 1 from public.media_assets a where a.id=m and a.owner_id=auth.uid() and a.status='ready' and a.deleted_at is null
  )) then raise exception 'Media must be ready and owned by the editor'; end if;
  return new;
end $$;
create trigger posts_media_check before insert or update on public.posts for each row execute function public.check_media_references();
create trigger site_draft_media_check before insert or update on public.site_drafts for each row execute function public.check_media_references();
create trigger site_public_media_check before insert or update on public.site_publications for each row execute function public.check_media_references();

create function public.protect_used_media() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if (tg_op='DELETE' or new.deleted_at is not null) and (
    exists (select 1 from public.posts where old.id=any(media_ids)) or
    exists (select 1 from public.site_drafts where old.id=any(media_ids)) or
    exists (select 1 from public.site_publications where old.id=any(media_ids))
  ) then raise exception 'This image is in use. Remove its references first.'; end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
create trigger protect_used_media before update or delete on public.media_assets for each row execute function public.protect_used_media();

create function public.claim_media_job(p_id uuid) returns setof public.media_assets language plpgsql security invoker set search_path = '' as $$
begin
  if not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Forbidden'; end if;
  perform pg_advisory_xact_lock(7782351);
  if exists(select 1 from public.media_assets where status='processing' and updated_at > now()-interval '5 minutes') then return; end if;
  return query update public.media_assets set status='processing',lease_token=gen_random_uuid(),updated_at=now()
   where id=p_id and owner_id=auth.uid() and deleted_at is null
   and (status in ('uploading','failed') or (status='processing' and updated_at < now()-interval '5 minutes')) returning *;
end $$;

create function public.save_site_document(p_config jsonb,p_media_ids uuid[],p_expected_version integer,p_publish boolean)
 returns integer language plpgsql security invoker set search_path = '' as $$
declare current_doc public.site_drafts; next_version integer;
begin
  if not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Forbidden'; end if;
  select * into current_doc from public.site_drafts where singleton for update;
  if current_doc.version <> p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
  insert into public.site_revisions(version,config) values(current_doc.version,current_doc.config);
  next_version := current_doc.version+1;
  update public.site_drafts set config=p_config,media_ids=p_media_ids,version=next_version,updated_at=now() where singleton;
  if p_publish then
    update public.site_publications set config=p_config,media_ids=p_media_ids,version=next_version,published_at=now() where singleton;
  end if;
  return next_version;
end $$;
revoke all on function public.capture_post_revision(),public.check_media_references(),public.protect_used_media(),public.claim_media_job(uuid),public.save_site_document(jsonb,uuid[],integer,boolean) from public,anon,authenticated;
grant execute on function public.claim_media_job(uuid),public.save_site_document(jsonb,uuid[],integer,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('journal-media','journal-media',false,20971520,array['image/jpeg','image/png','image/webp','image/avif']);
create policy journal_media_owner on storage.objects for all to authenticated
 using (bucket_id='journal-media' and exists(select 1 from public.media_assets a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid())) and exists(select 1 from public.admin_users where user_id=(select auth.uid())))
 with check (bucket_id='journal-media' and exists(select 1 from public.media_assets a where a.id::text=(storage.foldername(name))[1] and a.owner_id=(select auth.uid()) and a.deleted_at is null) and exists(select 1 from public.admin_users where user_id=(select auth.uid())));
create policy journal_media_published on storage.objects for select to anon,authenticated
 using (bucket_id='journal-media' and exists (
 select 1 from public.media_assets a, jsonb_array_elements(a.variants) v
 where a.id::text=(storage.foldername(name))[1] and a.status='ready' and a.deleted_at is null and v->>'path'=name
 and (exists(select 1 from public.posts p where p.status='published' and a.id=any(p.media_ids)) or exists(select 1 from public.site_publications s where a.id=any(s.media_ids)))
 ));
