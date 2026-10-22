import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const email = process.env.JOURNAL_ADMIN_EMAIL;
const password = process.env.JOURNAL_ADMIN_INITIAL_PASSWORD;
if (!email || !password)
  throw new Error(
    "Set JOURNAL_ADMIN_EMAIL and JOURNAL_ADMIN_INITIAL_PASSWORD for this one-time command.",
  );
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login` },
});
if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(
  JSON.stringify({
    userId: data.user?.id,
    email: data.user?.email,
    confirmed: !!data.user?.email_confirmed_at,
    verificationSent: !!data.user && !data.user.email_confirmed_at,
  }),
);
