import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const magic = Buffer.from("JOURNAL-BACKUP-1\n");
export function encryptBackup(data, key) {
  if (key.length !== 32)
    throw new Error("Backup key must contain exactly 32 bytes.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(magic);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([magic, iv, cipher.getAuthTag(), encrypted]);
}
export function decryptBackup(data, key) {
  if (
    !data.subarray(0, magic.length).equals(magic) ||
    data.length < magic.length + 28
  )
    throw new Error("Unsupported or incomplete backup.");
  const offset = magic.length;
  const cipher = createDecipheriv(
    "aes-256-gcm",
    key,
    data.subarray(offset, offset + 12),
  );
  cipher.setAAD(magic);
  cipher.setAuthTag(data.subarray(offset + 12, offset + 28));
  return Buffer.concat([
    cipher.update(data.subarray(offset + 28)),
    cipher.final(),
  ]);
}
