create table public.admin_users (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete restrict
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy "Administrator can verify own membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '' check (char_length(title) <= 200),
  slug text not null unique check (char_length(slug) between 1 and 160 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  content text not null default '' check (octet_length(content) <= 200000),
  category text not null default 'Personal Notes' check (category in ('Technology','Software Engineering','Tutorials','Career','Personal Notes')),
  cover_image_url text check (cover_image_url is null or (char_length(cover_image_url) <= 2048 and cover_image_url ~ '^https://')),
  cover_image_alt text not null default '' check (char_length(cover_image_alt) <= 300),
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  version integer not null default 1 check (version > 0),
  constraint published_content_required check (
    status <> 'published' or (length(btrim(title)) > 0 and length(btrim(content)) > 0 and published_at is not null)
  ),
  constraint cover_alt_required check (cover_image_url is null or length(btrim(cover_image_alt)) > 0)
);
create index posts_published_order_idx on public.posts (published_at desc, id desc) where status = 'published';
create index posts_author_id_idx on public.posts (author_id);
alter table public.posts enable row level security;
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

create policy "Readers can read published posts" on public.posts
  for select to anon, authenticated using (status = 'published');
create policy "Administrator can read owned drafts" on public.posts
  for select to authenticated using (
    author_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy "Administrator can create owned posts" on public.posts
  for insert to authenticated with check (
    author_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy "Administrator can update owned posts" on public.posts
  for update to authenticated using (
    author_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  ) with check (
    author_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy "Administrator can delete owned posts" on public.posts
  for delete to authenticated using (
    author_id = (select auth.uid()) and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

create function public.enforce_post_lifecycle() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' then
    if NEW.author_id is distinct from OLD.author_id then
      raise exception 'Post ownership cannot be changed' using errcode = '23514';
    end if;
    if OLD.published_at is not null and NEW.slug is distinct from OLD.slug then
      raise exception 'A published slug cannot be changed' using errcode = '23514';
    end if;
    NEW.created_at := OLD.created_at;
    NEW.published_at := OLD.published_at;
    NEW.version := OLD.version + 1;
  else
    NEW.created_at := statement_timestamp();
    NEW.published_at := null;
    NEW.version := 1;
  end if;
  NEW.updated_at := statement_timestamp();
  if NEW.status = 'published' and NEW.published_at is null then
    NEW.published_at := statement_timestamp();
  end if;
  return NEW;
end;
$$;
revoke all on function public.enforce_post_lifecycle() from public, anon, authenticated;
create trigger posts_lifecycle before insert or update on public.posts
  for each row execute function public.enforce_post_lifecycle();
