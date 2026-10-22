import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createServerClient } from "@supabase/ssr";

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const root = path.resolve(".test-auth");
await mkdir(root, { recursive: true, mode: 0o700 });
const directory = await mkdtemp(path.join(root, "session-"));
const browser = await chromium.launch({
  headless: false,
  channel: process.platform === "win32" ? "chrome" : undefined,
});
const context = await browser.newContext();
let storage;
try {
  const page = await context.newPage();
  page.on("framenavigated", frame => {
    if (frame === page.mainFrame()) console.log(`Test login page: ${new URL(frame.url()).pathname}`);
  });
  console.log(
    "Sign in in the temporary Chrome window. Your password is not recorded. The window closes automatically after sign-in.",
  );
  await page.goto("https://the-journal-blog-three.vercel.app/login");
  await page.waitForURL((url) => url.pathname === "/admin", {
    timeout: 900000,
    waitUntil: "domcontentloaded",
  });
  storage = await context.storageState();
  await browser.close();
  const base = new URL(
    process.env.JOURNAL_TEST_BASE_URL || "http://127.0.0.1:3107",
  );
  const file = path.join(directory, "storage.json");
  await writeFile(
    file,
    JSON.stringify({
      ...storage,
      cookies: storage.cookies.map((cookie) => ({
        ...cookie,
        domain: base.hostname,
        secure: base.protocol === "https:",
      })),
    }),
    { mode: 0o600 },
  );
  const result = spawnSync(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    {
      env: { ...process.env, JOURNAL_TEST_STORAGE_STATE: file },
      windowsHide: true,
      stdio: "inherit",
    },
  );
  process.exitCode = result.status || (result.error ? 1 : 0);
} finally {
  await browser.close();
  if (storage) {
    const cookies = new Map(
      storage.cookies.map((cookie) => [cookie.name, cookie.value]),
    );
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
          setAll: () => {},
        },
      },
    );
    await client.auth.signOut({ scope: "local" });
  }
  if (
    path.dirname(directory) === root &&
    path.basename(directory).startsWith("session-")
  )
    await rm(directory, { recursive: true, maxRetries: 5, retryDelay: 200 });
}
