// Next.js may use an internal hostname for Request.url. Match the browser Origin
// against the actual HTTP Host instead, without trusting caller-supplied forwarding headers.
export function sameCmsOrigin(request: Request) {
  const value = request.headers.get("origin"),
    host = request.headers.get("host");
  if (!value || !host) return false;
  try {
    const origin = new URL(value);
    if (origin.origin !== value || origin.username || origin.password)
      return false;
    const expected = new URL(`${origin.protocol}//${host}`);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    return (
      origin.host === expected.host &&
      (origin.protocol === "https:" ||
        (origin.protocol === "http:" &&
          (local || process.env.NODE_ENV === "development")))
    );
  } catch {
    return false;
  }
}
