import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = new URL(
  process.env.JOURNAL_TEST_BASE_URL || "http://127.0.0.1:3107",
);
if (!["http:", "https:"].includes(base.protocol))
  throw new Error("Expected an HTTP application URL.");
const directory = path.resolve(".audit-reports");
await mkdir(directory, { recursive: true });
const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  chromePath: process.env.CHROME_PATH,
});
const evidence = [];
try {
  for (const route of ["/", "/blog", "/login"]) {
    const result = await lighthouse(new URL(route, base).href, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    if (!result?.lhr || result.lhr.runtimeError)
      throw new Error(`Lighthouse could not audit ${route}.`);
    const report = result.lhr;
    const scores = Object.fromEntries(
      Object.entries(report.categories).map(([key, value]) => [
        key,
        Math.round(value.score * 100),
      ]),
    );
    const metrics = Object.fromEntries(
      [
        "first-contentful-paint",
        "largest-contentful-paint",
        "total-blocking-time",
        "cumulative-layout-shift",
      ].map((key) => [key, report.audits[key]?.numericValue]),
    );
    const failures = Object.values(report.audits)
      .filter(
        (a) =>
          a.score !== null && a.score < 1 && a.scoreDisplayMode === "binary",
      )
      .map((a) => ({ id: a.id, title: a.title }));
    await writeFile(
      path.join(
        directory,
        `lighthouse-${route === "/" ? "home" : route.slice(1)}.json`,
      ),
      result.report,
    );
    evidence.push({ route, scores, metrics, failures });
  }
} finally {
  await chrome.kill();
}
await writeFile(
  path.join(directory, "lighthouse-summary.json"),
  JSON.stringify(
    {
      testedAt: new Date().toISOString(),
      baseURL: base.href,
      mode: "Lighthouse simulated mobile",
      evidence,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(evidence, null, 2));
if (
  evidence.some(
    (item) =>
      item.scores.performance < 85 ||
      item.scores.accessibility < 100 ||
      item.metrics["cumulative-layout-shift"] > 0.1 ||
      item.metrics["total-blocking-time"] > 300,
  )
)
  process.exitCode = 1;
