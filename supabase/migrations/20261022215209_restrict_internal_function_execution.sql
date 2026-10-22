-- This event trigger is internal infrastructure, not a Data API endpoint.
-- Revoking EXECUTE does not disable the DDL event trigger itself.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
