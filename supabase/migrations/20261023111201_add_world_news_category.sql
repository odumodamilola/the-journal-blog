-- Add an editorial category without changing ownership or RLS policies.
set lock_timeout = '5s';
alter table public.posts drop constraint posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('Technology', 'Software Engineering', 'Tutorials', 'Career', 'Personal Notes', 'World News'));
