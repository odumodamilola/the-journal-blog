import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { encryptBackup, decryptBackup } from "./backup-crypto.mjs";
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
export async function backupMedia({ sessionFile }) {
  const state = JSON.parse(await readFile(sessionFile, "utf8"));
  const cookies = new Map(
    state.cookies.map((cookie) => [cookie.name, cookie.value]),
  );
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
        setAll: (values) =>
          values.forEach((cookie) => cookies.set(cookie.name, cookie.value)),
      },
    },
  );
  const { data: identity, error: authError } = await client.auth.getUser();
  if (authError || !identity.user)
    throw new Error(
      "Media backup requires a current, normal administrator session.",
    );
  const { data: admin, error: adminError } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", identity.user.id)
    .maybeSingle();
  if (adminError || !admin)
    throw new Error("Media backup requires the designated administrator.");
  const key = Buffer.from(
    (
      await readFile(
        process.env.JOURNAL_BACKUP_KEY_FILE || ".backup-key",
        "utf8",
      )
    ).trim(),
    "base64",
  );
  if (key.length !== 32)
    throw new Error("A valid separately stored backup key is required.");
  const root = path.resolve(process.env.JOURNAL_BACKUP_DIR || ".backups");
  await mkdir(root, { recursive: true, mode: 0o700 });
  const directory = await mkdtemp(
    path.join(root, `media-${new Date().toISOString().replace(/[:.]/g, "-")}-`),
  );
  const assets = [];
  for (let start = 0; ; start += 100) {
    const { data, error } = await client
      .from("media_assets")
      .select("*")
      .eq("owner_id", identity.user.id)
      .order("id")
      .range(start, start + 99);
    if (error) throw new Error("Unable to enumerate media for backup.");
    assets.push(...data);
    if (data.length < 100) break;
  }
  const files = [];
  for (const asset of assets) {
    const paths = [
      `${asset.id}/original`,
      ...(Array.isArray(asset.variants)
        ? asset.variants.map((v) => v.path)
        : []),
    ];
    for (let index = 0; index < paths.length; index++) {
      const objectPath = paths[index];
      if (
        typeof objectPath !== "string" ||
        !objectPath.startsWith(`${asset.id}/`) ||
        objectPath.includes("..")
      )
        throw new Error("Invalid stored media path.");
      const { data, error } = await client.storage
        .from("journal-media")
        .download(objectPath);
      if (error || !data) {
        if (index === 0 && asset.status !== "ready") continue;
        throw new Error(
          "A tracked media object could not be backed up. Partial archive preserved, not marked complete.",
        );
      }
      const bytes = Buffer.from(await data.arrayBuffer());
      const filename = `${asset.id}-${index}.jbackup`;
      const encrypted = encryptBackup(bytes, key);
      // Verify the same decrypt-and-integrity path used by recovery before accepting each object.
      if (hash(decryptBackup(encrypted, key)) !== hash(bytes))
        throw new Error("Media backup integrity check failed.");
      await writeFile(path.join(directory, filename), encrypted, {
        flag: "wx",
        mode: 0o600,
      });
      files.push({
        filename,
        path: objectPath,
        bytes: bytes.length,
        sha256: hash(bytes),
      });
    }
  }
  const manifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    bucket: "journal-media",
    assets,
    files,
  };
  await writeFile(
    path.join(directory, "manifest.jbackup"),
    encryptBackup(Buffer.from(JSON.stringify(manifest)), key),
    { flag: "wx", mode: 0o600 },
  );
  const report = {
    directory: path.basename(directory),
    assets: assets.length,
    objects: files.length,
    bytes: files.reduce((total, file) => total + file.bytes, 0),
    encrypted: true,
    verified: true,
  };
  await writeFile(
    path.join(directory, "inventory.json"),
    JSON.stringify(report, null, 2),
    { flag: "wx", mode: 0o600 },
  );
  console.log(JSON.stringify(report));
  return report;
}
export async function verifyMediaBackup(directory) {
  const root = path.resolve(process.env.JOURNAL_BACKUP_DIR || ".backups");
  const target = path.resolve(root, directory);
  if (
    path.dirname(target) !== root ||
    !path.basename(target).startsWith("media-")
  )
    throw new Error("Choose a media archive inside the backup directory.");
  const key = Buffer.from(
    (
      await readFile(
        process.env.JOURNAL_BACKUP_KEY_FILE || ".backup-key",
        "utf8",
      )
    ).trim(),
    "base64",
  );
  const manifest = JSON.parse(
    decryptBackup(
      await readFile(path.join(target, "manifest.jbackup")),
      key,
    ).toString("utf8"),
  );
  for (const file of manifest.files) {
    if (!/^[0-9a-f-]+-\d+\.jbackup$/.test(file.filename))
      throw new Error("Invalid archive filename.");
    const bytes = decryptBackup(
      await readFile(path.join(target, file.filename)),
      key,
    );
    if (bytes.length !== file.bytes || hash(bytes) !== file.sha256)
      throw new Error("Media recovery integrity mismatch.");
  }
  return {
    objects: manifest.files.length,
    assets: manifest.assets.length,
    verified: true,
  };
}
