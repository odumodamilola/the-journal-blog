import { notFound } from "next/navigation";
import { adminPost } from "@/lib/posts/queries";
import { PostForm } from "@/components/PostForm";
export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const post = await adminPost((await params).id);
  if (!post) notFound();
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-6 py-12">
      <PostForm post={post} />
    </main>
  );
}
