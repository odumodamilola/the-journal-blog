"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";
import { CategoryArtwork } from "./CategoryArtwork";

// Keep ordinary covers on Unsplash's responsive CDN. The initial homepage cover
// can opt into first-party caching, with a direct-CDN retry if encoding fails.
function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  if (url.hostname !== "images.unsplash.com")
    throw new Error("Unsupported image loader host");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  return url.href;
}

/** Reserve the same crop if a third-party image temporarily becomes unavailable. */
export function ExternalPostCover({
  src,
  alt,
  category,
  priority,
  cachePriority = false,
  sizes,
}: {
  src: string;
  alt: string;
  category: string;
  priority: boolean;
  cachePriority?: boolean;
  sizes: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [directSource, setDirectSource] = useState<string | null>(null);
  const unsplash = new URL(src).hostname === "images.unsplash.com";
  const useCache =
    unsplash && priority && cachePriority && directSource !== src;
  if (failedSource === src)
    return <CategoryArtwork category={category} className="cover-image" />;
  return (
    <Image
      loader={unsplash && !useCache ? unsplashLoader : undefined}
      src={src}
      alt={alt}
      width={1500}
      height={1000}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      sizes={sizes}
      className="cover-image"
      onError={() => (useCache ? setDirectSource(src) : setFailedSource(src))}
    />
  );
}
