import "server-only";
import { adminSession } from "../auth/require-admin";
import { sameCmsOrigin } from "./origin";
export function apiError(message: string, status = 400) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function cmsSession(request: Request) {
  if (request.method !== "GET") {
    if (!sameCmsOrigin(request))
      return { error: apiError("Invalid request origin.", 403) } as const;
  }
  const session = await adminSession();
  return session
    ? ({ session } as const)
    : ({ error: apiError("Sign in to the editorial studio.", 401) } as const);
}
export async function smallJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("Expected JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 250000) {
      await reader.cancel();
      throw new Error("Request too large.");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
