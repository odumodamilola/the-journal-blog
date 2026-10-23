begin;
select set_config('journal.test_admin',(select user_id::text from public.admin_users),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('journal.test_admin'),'role','authenticated')::text,true);
set local role authenticated;
insert into public.media_assets(id,owner_id,filename,mime_type,original_bytes,status,width,height,variants) values
 ('00000000-0000-4000-8000-00000000c001',auth.uid(),'private.jpg','image/jpeg',100,'ready',100,100,'[{"name":"master.webp","path":"00000000-0000-4000-8000-00000000c001/test/master.webp","width":100,"height":100,"bytes":50,"format":"webp"}]'),
 ('00000000-0000-4000-8000-00000000c002',auth.uid(),'public.jpg','image/jpeg',100,'ready',100,100,'[{"name":"master.webp","path":"00000000-0000-4000-8000-00000000c002/test/master.webp","width":100,"height":100,"bytes":50,"format":"webp"}]');
insert into public.posts(id,author_id,slug,title,content,status,media_ids) values
 ('00000000-0000-4000-8000-00000000d001',auth.uid(),'cms-private-fixture','CMS private','Text','draft',array['00000000-0000-4000-8000-00000000c001']::uuid[]),
 ('00000000-0000-4000-8000-00000000d002',auth.uid(),'cms-public-fixture','CMS public','Text','published',array['00000000-0000-4000-8000-00000000c002']::uuid[]);
update public.posts set title='New title' where id='00000000-0000-4000-8000-00000000d001';
do $$ begin
 if not exists(select 1 from public.post_revisions where post_id='00000000-0000-4000-8000-00000000d001' and version=1) then raise exception 'Revision not captured'; end if;
 begin update public.media_assets set deleted_at=now() where id='00000000-0000-4000-8000-00000000c002'; raise exception 'Used image was trashed'; exception when raise_exception then if sqlerrm='Used image was trashed' then raise; end if; end;
 perform public.save_site_document('{"test":"draft"}','{}',(select version from public.site_drafts),false);
 if (select config from public.site_publications) ? 'test' then raise exception 'Draft site leaked'; end if;
 begin perform public.save_site_document('{}','{}',-1,true); raise exception 'Version conflict not detected'; exception when serialization_failure then null; end;
 perform public.save_site_document('{"heroMediaId":"","sections":[{"id":"hidden","visible":false,"body":"Secret hidden draft","mediaIds":["00000000-0000-4000-8000-00000000c001"]}]}',array['00000000-0000-4000-8000-00000000c001']::uuid[],(select version from public.site_drafts),true);
 if (select config::text from public.site_publications) like '%Secret hidden draft%' or (select cardinality(media_ids) from public.site_publications)>0 then raise exception 'Hidden section leaked'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$ begin
 if exists(select 1 from public.media_assets where id='00000000-0000-4000-8000-00000000c001') then raise exception 'Private media leaked'; end if;
 if not exists(select 1 from public.media_assets where id='00000000-0000-4000-8000-00000000c002') then raise exception 'Published media not readable'; end if;
 begin perform public.claim_media_job('00000000-0000-4000-8000-00000000c001'); raise exception 'Anonymous media claim succeeded'; exception when insufficient_privilege then null; end;
 begin perform 1 from public.site_drafts; raise exception 'Site drafts were readable'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-00000000a002","role":"authenticated"}',true);
set local role authenticated;
do $$ declare affected integer; begin
 if exists(select 1 from public.media_assets where id='00000000-0000-4000-8000-00000000c001') then raise exception 'Non-admin saw private media'; end if;
 update public.site_publications set config='{}'; get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Non-admin changed the site'; end if;
 begin insert into public.media_assets(owner_id,filename,mime_type,original_bytes) values(auth.uid(),'attacker.jpg','image/jpeg',100); raise exception 'Non-admin uploaded'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: private media, site draft separation, version conflicts, revisions, in-use protection and non-admin isolation' as result;
