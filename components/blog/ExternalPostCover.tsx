"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";
import { CategoryArtwork } from "./CategoryArtwork";

// Unsplash already supplies responsive encodings. Avoid fetching a 2400px master
// on our server just to recompress it into a 160px card thumbnail.
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
  sizes,
}: {
  src: string;
  alt: string;
  category: string;
  priority: boolean;
  sizes: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === src)
    return <CategoryArtwork category={category} className="cover-image" />;
  return (
    <Image
      loader={
        new URL(src).hostname === "images.unsplash.com"
          ? unsplashLoader
          : undefined
      }
      src={src}
      alt={alt}
      width={1500}
      height={1000}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      sizes={sizes}
      className="cover-image"
      onError={() => setFailedSource(src)}
    />
  );
}
