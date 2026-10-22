import { spawn, spawnSync } from "node:child_process";

const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3107",
  ],
  { stdio: "ignore", windowsHide: true },
);
try {
  let ready = false;
  for (let attempt = 0; attempt < 60 && server.exitCode === null; attempt++) {
    try {
      ready = (
        await fetch("http://127.0.0.1:3107/login", {
          signal: AbortSignal.timeout(2000),
        })
      ).ok;
    } catch {
      /* server is still starting */
    }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!ready)
    throw new Error(
      "Production server did not become ready for the performance gate.",
    );
  const result = spawnSync(
    process.execPath,
    ["scripts/performance-audit.mjs"],
    {
      env: { ...process.env, JOURNAL_TEST_BASE_URL: "http://127.0.0.1:3107" },
      stdio: "inherit",
      windowsHide: true,
    },
  );
  process.exitCode = result.status || (result.error ? 1 : 0);
} finally {
  server.kill();
}
