import { notFound } from "next/navigation";
import { adminPost } from "@/lib/posts/queries";
import { Article } from "@/components/blog/Article";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const post = await adminPost((await params).id);
  if (!post) notFound();
  return <Article post={post} preview />;
}
