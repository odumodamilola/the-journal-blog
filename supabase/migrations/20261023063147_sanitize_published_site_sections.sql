create or replace function public.save_site_document(p_config jsonb,p_media_ids uuid[],p_expected_version integer,p_publish boolean)
 returns integer language plpgsql security invoker set search_path = '' as $$
declare current_doc public.site_drafts; next_version integer; public_config jsonb; public_media uuid[];
begin
  if not exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Forbidden'; end if;
  select * into current_doc from public.site_drafts where singleton for update;
  if current_doc.version <> p_expected_version then raise exception 'Version conflict' using errcode='40001'; end if;
  insert into public.site_revisions(version,config) values(current_doc.version,current_doc.config);
  next_version := current_doc.version+1;
  update public.site_drafts set config=p_config,media_ids=p_media_ids,version=next_version,updated_at=now() where singleton;
  if p_publish then
    public_config := jsonb_set(p_config,'{sections}',coalesce((select jsonb_agg(s) from jsonb_array_elements(coalesce(p_config->'sections','[]')) s where s->>'visible'='true'),'[]'));
    select coalesce(array_agg(distinct image_id::uuid),'{}') into public_media from (
      select public_config->>'heroMediaId' image_id
      union all select jsonb_array_elements_text(s->'mediaIds') from jsonb_array_elements(public_config->'sections') s
    ) images where image_id is not null and image_id<>'';
    update public.site_publications set config=public_config,media_ids=public_media,version=next_version,published_at=now() where singleton;
  end if;
  return next_version;
end $$;
revoke all on function public.save_site_document(jsonb,uuid[],integer,boolean) from public,anon;
grant execute on function public.save_site_document(jsonb,uuid[],integer,boolean) to authenticated;
