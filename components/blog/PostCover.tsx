import { ExternalPostCover } from "./ExternalPostCover";
import { mediaIdFromUrl } from "@/lib/cms/content";
import type { PostSummary } from "@/lib/posts/queries";
import { MediaImage } from "../cms/MediaImage";
import { CategoryArtwork } from "./CategoryArtwork";
export function PostCover({
  post,
  priority = false,
  cachePriority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
}: {
  post: PostSummary;
  priority?: boolean;
  cachePriority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const managed = mediaIdFromUrl(post.cover_image_url);
  if (!post.cover_image_url)
    return <CategoryArtwork category={post.category} className={className} />;
  return (
    <div className={`post-cover ${className}`}>
      {managed ? (
        <MediaImage
          id={managed}
          alt={post.cover_image_alt}
          priority={priority}
          sizes={sizes}
          className="cover-image"
        />
      ) : (
        <ExternalPostCover
          src={post.cover_image_url}
          alt={post.cover_image_alt}
          category={post.category}
          priority={priority}
          cachePriority={cachePriority}
          sizes={sizes}
        />
      )}
    </div>
  );
}
