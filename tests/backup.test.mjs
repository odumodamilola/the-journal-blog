import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { encryptBackup, decryptBackup } from "../scripts/backup-crypto.mjs";
import { connectionEnvironment } from "../scripts/backup.mjs";

test("encrypted backups round-trip without plaintext disclosure", () => {
  const key = randomBytes(32);
  const original = Buffer.from(
    "private draft content and sensitive Auth records",
  );
  const backup = encryptBackup(original, key);
  assert.deepEqual(decryptBackup(backup, key), original);
  assert.equal(backup.includes(original), false);
  assert.notDeepEqual(encryptBackup(original, key), backup);
});
test("backup integrity rejects corruption, wrong keys and unknown formats", () => {
  const key = randomBytes(32);
  const backup = encryptBackup(Buffer.from("draft"), key);
  assert.throws(() => decryptBackup(backup, randomBytes(32)));
  backup[backup.length - 1] ^= 1;
  assert.throws(() => decryptBackup(backup, key));
  assert.throws(() => decryptBackup(Buffer.from("not a backup"), key));
});
test("CLI connection plans are parsed, never executed", () => {
  const plan = [
    'PGHOST="example.com"',
    'PGPORT="5432"',
    'PGUSER="admin"',
    'PGPASSWORD="safevalue"',
    'PGDATABASE="postgres"',
  ]
    .map((line) => `export ${line}`)
    .join("\n");
  assert.equal(connectionEnvironment(plan).PGHOST, "example.com");
  assert.throws(() =>
    connectionEnvironment(plan.replace('"safevalue"', '"$(malicious)"')),
  );
  assert.throws(() => connectionEnvironment(""));
});
