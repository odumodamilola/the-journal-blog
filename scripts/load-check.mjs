import { performance } from "node:perf_hooks";
import { mkdir, writeFile } from "node:fs/promises";

const base = new URL(
  process.env.JOURNAL_TEST_BASE_URL || "http://127.0.0.1:3107",
);
const concurrency = Number(process.env.JOURNAL_LOAD_CONCURRENCY || 5);
const requests = Number(process.env.JOURNAL_LOAD_REQUESTS || 50);
if (
  !Number.isInteger(concurrency) ||
  concurrency < 1 ||
  concurrency > 10 ||
  !Number.isInteger(requests) ||
  requests < 1 ||
  requests > 200
)
  throw new Error("Use 1–10 concurrent readers and 1–200 total requests.");
const routes = ["/", "/blog", "/blog?q=technology", "/login", "/sitemap.xml"];
const measurements = [];
let next = 0;
const started = performance.now();
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (next < requests) {
      const index = next++;
      const route = routes[index % routes.length];
      const begin = performance.now();
      try {
        const response = await fetch(new URL(route, base), {
          signal: AbortSignal.timeout(15000),
        });
        await response.arrayBuffer();
        measurements.push({
          route,
          status: response.status,
          elapsedMs: performance.now() - begin,
        });
      } catch {
        measurements.push({
          route,
          status: 0,
          elapsedMs: performance.now() - begin,
        });
      }
    }
  }),
);
const elapsed = performance.now() - started;
const ordered = measurements.map((row) => row.elapsedMs).sort((a, b) => a - b);
const report = {
  testedAt: new Date().toISOString(),
  baseURL: base.href,
  concurrency,
  requests,
  errors: measurements.filter((row) => row.status !== 200).length,
  p50Ms: Math.round(ordered[Math.ceil(ordered.length * 0.5) - 1]),
  p95Ms: Math.round(ordered[Math.ceil(ordered.length * 0.95) - 1]),
  maxMs: Math.round(ordered.at(-1)),
  requestsPerSecond: Number((requests / (elapsed / 1000)).toFixed(2)),
  measurements,
};
await mkdir(".audit-reports", { recursive: true });
await writeFile(
  ".audit-reports/load-check.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ ...report, measurements: undefined }));
if (report.errors || report.p95Ms > 3000) process.exitCode = 1;
