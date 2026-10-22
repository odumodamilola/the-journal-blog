import { PostForm } from "@/components/PostForm";
import { randomUUID } from "node:crypto";
export default function NewPost() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-6 py-12">
      <PostForm newId={randomUUID()} />
    </main>
  );
}
