import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { randomBytes, createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encryptBackup } from "./backup-crypto.mjs";

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });
  if (result.error || result.status !== 0) {
    let diagnostic = options.env
      ? String(result.stderr || result.error?.code || "").slice(-2000)
      : "details suppressed to protect database credentials";
    for (const name of [
      "PGHOST",
      "PGUSER",
      "PGPASSWORD",
      "PGDATABASE",
      "JOURNAL_BACKUP_DB_URL",
      "JOURNAL_BACKUP_KEY",
    ])
      if (options.env?.[name])
        diagnostic = diagnostic.split(options.env[name]).join(`[${name}]`);
    throw new Error(`${path.basename(command)} failed: ${diagnostic}`);
  }
  return result.stdout;
}
export function postgresTool(name) {
  return process.env.JOURNAL_PG_BIN
    ? path.join(
        process.env.JOURNAL_PG_BIN,
        process.platform === "win32" ? `${name}.exe` : name,
      )
    : name;
}
export function connectionEnvironment(script) {
  const variables = {};
  for (const name of [
    "PGHOST",
    "PGPORT",
    "PGUSER",
    "PGPASSWORD",
    "PGDATABASE",
  ]) {
    const value = script
      .match(new RegExp(`^export ${name}=(.*)$`, "m"))?.[1]
      ?.trim();
    if (!value) throw new Error(`Backup plan is missing ${name}.`);
    const quoted =
      value.match(/^"([^"$`\\\r\n]*)"$/) || value.match(/^'([^'\r\n]*)'$/);
    if (!quoted)
      throw new Error(
        "Unsupported CLI backup-plan quoting. Do not evaluate the plan as shell code.",
      );
    variables[name] = quoted[1];
  }
  return {
    ...process.env,
    ...variables,
    PGSSLMODE: "require",
    PGCONNECT_TIMEOUT: "20",
  };
}
export async function backup() {
  const directory = path.resolve(process.env.JOURNAL_BACKUP_DIR || ".backups");
  const keyFile = path.resolve(
    process.env.JOURNAL_BACKUP_KEY_FILE || ".backup-key",
  );
  let key;
  if (process.env.JOURNAL_BACKUP_KEY)
    key = Buffer.from(process.env.JOURNAL_BACKUP_KEY, "base64");
  else {
    try {
      key = Buffer.from((await readFile(keyFile, "utf8")).trim(), "base64");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      key = randomBytes(32);
      await writeFile(keyFile, key.toString("base64"), {
        flag: "wx",
        mode: 0o600,
      });
    }
  }
  if (key.length !== 32) throw new Error("Invalid backup encryption key.");
  let environment;
  if (process.env.JOURNAL_BACKUP_DB_URL) {
    const url = new URL(process.env.JOURNAL_BACKUP_DB_URL);
    if (!["postgres:", "postgresql:"].includes(url.protocol))
      throw new Error("Expected a Postgres connection string.");
    environment = {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: url.pathname.slice(1),
      PGSSLMODE: "require",
      PGCONNECT_TIMEOUT: "20",
    };
  } else {
    const profile = process.env.JOURNAL_SUPABASE_PROFILE || "thejournal";
    const plan = run(
      "supabase",
      [
        "--profile",
        profile,
        "db",
        "dump",
        "--linked",
        "--schema",
        "public,auth",
        "--dry-run",
      ],
      { encoding: "utf8" },
    );
    environment = connectionEnvironment(plan);
  }
  const dump = run(
    postgresTool("pg_dump"),
    [
      "--role=postgres",
      "--format=custom",
      "--no-owner",
      "--no-privileges",
      "--schema=public",
      "--schema=auth",
      "--lock-wait-timeout=10s",
    ],
    { env: environment },
  );
  if (!dump.subarray(0, 5).equals(Buffer.from("PGDMP")))
    throw new Error("Database export was not a valid custom-format archive.");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const filename = `journal-${new Date().toISOString().replace(/[:.]/g, "-")}.jbackup`;
  const encrypted = encryptBackup(dump, key);
  await writeFile(path.join(directory, filename), encrypted, {
    flag: "wx",
    mode: 0o600,
  });
  const evidence = {
    file: filename,
    createdAt: new Date().toISOString(),
    sha256: createHash("sha256").update(encrypted).digest("hex"),
    encryptedBytes: encrypted.length,
    schemas: ["public", "auth"],
    includesStorageObjects: false,
  };
  await writeFile(
    path.join(directory, `${filename}.json`),
    JSON.stringify(evidence, null, 2),
    { flag: "wx", mode: 0o600 },
  );
  // Prune only this tool's explicitly named archives after a successful export.
  const cutoff = Date.now() - 30 * 86400000;
  for (const file of await readdir(directory)) {
    const match = file.match(
      /^journal-(\d{4}-\d{2}-\d{2})T.*\.jbackup(?:\.json)?$/,
    );
    if (match && Date.parse(match[1]) < cutoff)
      await unlink(path.join(directory, file));
  }
  console.log(JSON.stringify(evidence));
  return evidence;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  backup().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
