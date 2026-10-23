import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
  unlink,
  rm,
} from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import net from "node:net";
import { run, postgresTool } from "./backup.mjs";
import { decryptBackup } from "./backup-crypto.mjs";

const backupRoot = path.resolve(process.env.JOURNAL_BACKUP_DIR || ".backups");
const filename =
  process.argv[2] ||
  (await readdir(backupRoot))
    .filter((name) => /^journal-.*\.jbackup$/.test(name))
    .sort()
    .at(-1);
if (!filename || path.basename(filename) !== filename)
  throw new Error(
    "Supply an archive filename inside JOURNAL_BACKUP_DIR, not a path.",
  );
const key = Buffer.from(
  process.env.JOURNAL_BACKUP_KEY ||
    (
      await readFile(
        process.env.JOURNAL_BACKUP_KEY_FILE || ".backup-key",
        "utf8",
      )
    ).trim(),
  "base64",
);
const archive = decryptBackup(
  await readFile(path.join(backupRoot, filename)),
  key,
);
const drillRoot = path.resolve(".recovery-drill");
await mkdir(drillRoot, { recursive: true, mode: 0o700 });
const temporary = await mkdtemp(path.join(drillRoot, "isolated-"));
const data = path.join(temporary, "data");
const passwordFile = path.join(temporary, "password");
const password = randomBytes(32).toString("base64url");
const port = await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const environment = {
  ...process.env,
  PGHOST: "127.0.0.1",
  PGPORT: String(port),
  PGUSER: "postgres",
  PGPASSWORD: password,
  PGDATABASE: "postgres",
  PGSSLMODE: "disable",
};
let started = false;
try {
  await writeFile(passwordFile, password, { flag: "wx", mode: 0o600 });
  run(postgresTool("initdb"), [
    "--pgdata",
    data,
    "--username=postgres",
    "--auth=scram-sha-256",
    "--pwfile",
    passwordFile,
    "--encoding=UTF8",
    "--no-locale",
  ]);
  await unlink(passwordFile);
  started = true;
  run(
    postgresTool("pg_ctl"),
    [
      "-D",
      data,
      "-l",
      path.join(temporary, "postgres.log"),
      "-o",
      `-h 127.0.0.1 -p ${port}`,
      "-w",
      "start",
    ],
    { stdio: "ignore" },
  );
  const sql = (statement) =>
    run(
      postgresTool("psql"),
      ["-X", "-v", "ON_ERROR_STOP=1", "-At", "-c", statement],
      { env: environment, encoding: "utf8" },
    );
  sql(
    'drop schema public; create role anon; create role authenticated; create role service_role; create role supabase_auth_admin; create role supabase_admin; create schema extensions; create extension pgcrypto with schema extensions; create extension "uuid-ossp" with schema extensions;',
  );
  run(
    postgresTool("pg_restore"),
    [
      "--exit-on-error",
      "--single-transaction",
      "--no-owner",
      "--no-privileges",
      "--dbname=postgres",
    ],
    { env: environment, input: archive },
  );
  const counts = JSON.parse(
    sql(
      "select json_build_object('posts', (select count(*) from public.posts), 'authUsers', (select count(*) from auth.users), 'administrators', (select count(*) from public.admin_users), 'rlsEnabled', (select bool_and(relrowsecurity) from pg_class where oid in ('public.posts'::regclass, 'public.admin_users'::regclass)))",
    ),
  );
  if (!counts.rlsEnabled || counts.administrators !== 1)
    throw new Error("Restored database failed access-control checks.");
  // The backup contains ACL-independent objects. Reapply the app's explicit API grants on recovery.
  run(postgresTool("psql"), ["-X", "-v", "ON_ERROR_STOP=1"], {
    env: environment,
    input: await readFile("supabase/recovery/application-grants.sql", "utf8"),
  });
  if (
    sql(
      "select has_function_privilege('anon', 'public.enforce_post_lifecycle()', 'execute') or has_function_privilege('authenticated', 'public.enforce_post_lifecycle()', 'execute')",
    ).trim() !== "f"
  )
    throw new Error(
      "Internal trigger execution privileges were not restricted.",
    );
  const permissions = await readFile("supabase/tests/permissions.sql", "utf8");
  if (process.env.JOURNAL_TEST_MIGRATION) {
    // Local policy harness only, not a substitute for hosted Storage integration tests.
    sql(
      "create schema storage; grant usage on schema storage to anon,authenticated; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security; grant select,insert,update,delete on storage.objects to authenticated; grant select on storage.objects to anon; create function storage.foldername(name text) returns text[] language sql immutable as 'select string_to_array(name, ''/'')';",
    );
    const migrationDirectory = path.dirname(process.env.JOURNAL_TEST_MIGRATION);
    const firstMigration = path.basename(process.env.JOURNAL_TEST_MIGRATION);
    for (const file of (await readdir(migrationDirectory))
      .filter((file) => file.endsWith(".sql") && file >= firstMigration)
      .sort()) {
      run(postgresTool("psql"), ["-X", "-v", "ON_ERROR_STOP=1"], {
        env: environment,
        input: await readFile(path.join(migrationDirectory, file), "utf8"),
      });
    }
  }
  run(postgresTool("psql"), ["-X", "-v", "ON_ERROR_STOP=1"], {
    env: environment,
    input: permissions,
  });
  if (
    process.env.JOURNAL_TEST_MIGRATION ||
    sql("select to_regclass('public.media_assets') is not null").trim() === "t"
  ) {
    run(postgresTool("psql"), ["-X", "-v", "ON_ERROR_STOP=1"], {
      env: environment,
      input: await readFile("supabase/tests/cms-permissions.sql", "utf8"),
    });
  }
  const result = {
    verifiedAt: new Date().toISOString(),
    archive: filename,
    isolatedLocalRestore: true,
    permissionTestsPassed: true,
    ...counts,
  };
  await mkdir(".audit-reports", { recursive: true });
  await writeFile(
    ".audit-reports/recovery-drill.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
} finally {
  let stopped = !started;
  if (started) {
    try {
      run(postgresTool("pg_ctl"), ["-D", data, "-m", "fast", "-w", "stop"], {
        stdio: "ignore",
      });
      stopped = true;
    } catch {
      console.error(
        "Recovery database did not stop; its files were preserved for safe cleanup.",
      );
    }
  }
  if (
    stopped &&
    path.dirname(temporary) === drillRoot &&
    path.basename(temporary).startsWith("isolated-")
  )
    await rm(temporary, { recursive: true, maxRetries: 10, retryDelay: 200 });
}
