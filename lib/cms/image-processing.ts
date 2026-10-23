import sharp from "sharp";
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const imageMimes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
export async function inspectImage(input: Buffer) {
  if (!input.length || input.length > MAX_UPLOAD_BYTES)
    throw new Error("Choose an image under 20 MB.");
  const meta = await sharp(input, {
    limitInputPixels: 60_000_000,
    animated: false,
    failOn: "warning",
  }).metadata();
  if (
    !["jpeg", "png", "webp", "heif", "avif"].includes(meta.format || "") ||
    !meta.width ||
    !meta.height ||
    (meta.pages || 1) > 1
  )
    throw new Error("Choose a still JPEG, PNG, WebP, or AVIF image.");
  // Standard binaries support AVIF but not arbitrary HEIC codecs.
  if (meta.format === "heif" && meta.compression !== "av1")
    throw new Error("Export HEIC as JPEG or PNG before uploading.");
  return meta;
}
export async function encodeImage(
  input: Buffer,
  width: number,
  format: "webp" | "avif",
  lossless = false,
) {
  const pipeline = sharp(input, {
    limitInputPixels: 60_000_000,
    animated: false,
    failOn: "warning",
  })
    .rotate()
    .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb");
  return format === "webp"
    ? pipeline
        .webp({ quality: 86, effort: 5, lossless })
        .toBuffer({ resolveWithObject: true })
    : pipeline
        .avif({ quality: 60, effort: 4, chromaSubsampling: "4:4:4", lossless })
        .toBuffer({ resolveWithObject: true });
}
