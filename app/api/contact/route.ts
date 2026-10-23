import { publicClient } from "@/lib/supabase/public";
import { sameCmsOrigin } from "@/lib/cms/origin";
import { validateContact } from "@/lib/contact";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status: number) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function POST(request: Request) {
  if (!sameCmsOrigin(request))
    return reply({ error: "Invalid request origin." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Expected JSON." }, 415);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "A message is required." }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 24000) {
        await reader.cancel();
        return reply({ error: "Message too large." }, 413);
      }
      chunks.push(value);
    }
    const result = validateContact(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (Object.keys(result.errors).length)
      return reply(
        { error: "Please check your message.", errors: result.errors },
        400,
      );
    // Insert only, return=minimal. Never request an inbox row through anon access.
    const { error } = await publicClient()
      .from("contact_messages")
      .insert(result.data);
    if (error)
      return reply(
        {
          error:
            error.code === "P0001"
              ? "Too many messages. Please try again later."
              : "We could not save your message. Please try again later.",
        },
        error.code === "P0001" ? 429 : 503,
      );
    return reply(
      {
        message:
          "Your message has been saved to the editor’s private inbox. Thank you for writing.",
      },
      201,
    );
  } catch {
    return reply(
      {
        error:
          "We could not accept this message. Please check the fields and try again.",
      },
      400,
    );
  }
}
