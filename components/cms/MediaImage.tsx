import { mediaAsset } from "@/lib/cms/queries";
import { variantsOf } from "@/lib/cms/types";
import { mediaUrl } from "@/lib/cms/content";
export async function MediaImage({
  id,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
}: {
  id: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const asset = await mediaAsset(id);
  if (!asset) return null;
  const variants = variantsOf(asset.variants);
  const srcset = (format: string) =>
    variants
      .filter((v) => v.format === format)
      .sort((a, b) => a.width - b.width)
      .map((v) => `${mediaUrl(id, v.name)} ${v.width}w`)
      .join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      {/* Already encoded responsive derivatives; no second lossy optimization. */}
      <img
        src={mediaUrl(id)}
        alt={alt ?? asset.alt}
        width={asset.width!}
        height={asset.height!}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        sizes={sizes}
        srcSet={srcset("webp")}
        className={className}
      />
    </picture>
  );
}
