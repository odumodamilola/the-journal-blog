import { expect, type Page, type Browser, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import AxeBuilder from "@axe-core/playwright";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "../../lib/types/database";
import { backupMedia, verifyMediaBackup } from "../../scripts/backup-media.mjs";
import { defaultSite, readSite } from "../../lib/cms/site-config";
export async function editorialAcceptance({
  page,
  browser,
}: {
  page: Page;
  browser: Browser;
}) {
  test.skip(
    !process.env.JOURNAL_TEST_STORAGE_STATE,
    "A normal administrator session is required for media and visual CMS acceptance.",
  );
  test.setTimeout(300000);
  const state = JSON.parse(
    await readFile(process.env.JOURNAL_TEST_STORAGE_STATE!, "utf8"),
  );
  await page.context().addCookies(state.cookies);
  const cookies = new Map<string, string>(
    state.cookies.map((cookie: { name: string; value: string }) => [
      cookie.name,
      cookie.value,
    ]),
  );
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
        setAll: (values) =>
          values.forEach((cookie) => cookies.set(cookie.name, cookie.value)),
      },
    },
  );
  const readerContext = await browser.newContext();
  const reader = await readerContext.newPage();
  const slug = `editorial-acceptance-${Date.now()}`;
  let postId: string | undefined, assetId: string | undefined;
  let originalConfig: unknown;
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  // Authenticated requests run in-page so same-origin CSRF protection is exercised.
  const api = async (path: string, method: string, body?: unknown) =>
    page.evaluate(
      async ({ path, method, body }) => {
        const result = await fetch(path, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        return { status: result.status, body: await result.json() };
      },
      { path, method, body },
    );
  try {
    await page.goto("/admin/posts/new");
    await page
      .getByLabel("Title", { exact: true })
      .fill("Visual CMS acceptance fixture");
    await page.getByLabel("Article URL").fill(slug);
    await page
      .getByLabel("Short description")
      .fill(
        "Temporary fixture validating rich text and private image publishing.",
      );
    const content = page.getByRole("textbox", {
      name: "Article content",
      exact: true,
    });
    await content.fill("A carefully formatted story.");
    await content.press("ControlOrMeta+a");
    await page.getByRole("button", { name: "Bold", exact: true }).click();
    await page.getByLabel("Text color", { exact: true }).fill("#24543d");
    await page
      .getByLabel("Text font", { exact: true })
      .selectOption("Newsreader");
    await content.press("End");
    await content.press("Enter");
    await page
      .getByRole("button", { name: "Insert image", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    const fixture = await sharp(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2304"><rect width="4096" height="2304" fill="#d6dec4"/><circle cx="2700" cy="700" r="500" fill="#b75e3b"/><path d="M500 2304V1500a900 900 0 0 1 1800 0v804" fill="#295039"/></svg>',
      ),
    )
      .jpeg({ quality: 95 })
      .toBuffer();
    await dialog
      .getByLabel("Upload an image")
      .setInputFiles({
        name: "journal-acceptance-fixture.jpg",
        mimeType: "image/jpeg",
        buffer: fixture,
      });
    await expect(dialog.getByRole("status")).toContainText("Image ready", {
      timeout: 180000,
    });
    await dialog
      .getByLabel("Image description", { exact: true })
      .fill("An abstract green arch and orange sun");
    await dialog
      .getByLabel("Caption (optional)")
      .fill("A temporary acceptance-test illustration.");
    await dialog
      .getByRole("button", { name: "Insert image", exact: true })
      .click();
    const inserted = page.locator(".tiptap img");
    await expect(inserted).toBeVisible();
    assetId = (await inserted.getAttribute("src"))!.match(
      /\/media\/([^/]+)\//,
    )![1];
    expect(
      (await reader.request.get(`/media/${assetId}/master.webp`)).status(),
    ).toBe(404);
    await audit();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("Draft saved privately.")).toBeVisible();
    const row = page
      .getByRole("row")
      .filter({ hasText: "Visual CMS acceptance fixture" });
    const edit = await row
      .getByRole("link", { name: "Edit", exact: true })
      .getAttribute("href");
    postId = edit!.split("/")[3];
    expect((await reader.goto(`/blog/${slug}`))?.status()).toBe(404);
    await row.getByRole("link", { name: "Preview", exact: true }).click();
    await expect(
      page.getByRole("img", { name: "An abstract green arch and orange sun" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to editor" }).click();
    await expect(page.locator(".tiptap strong")).toContainText(
      "A carefully formatted story",
    );
    await page
      .getByRole("button", { name: "Publish article", exact: true })
      .click();
    await expect(
      page.getByText("Article published. It is now available to readers."),
    ).toBeVisible();
    await reader.goto(`/blog/${slug}`);
    await expect(
      reader.getByRole("img", {
        name: "An abstract green arch and orange sun",
      }),
    ).toBeVisible();
    await expect(reader.locator("main strong")).toContainText(
      "A carefully formatted story",
    );
    const delivery = await reader.request.get(`/media/${assetId}/master.webp`);
    expect(delivery.status()).toBe(200);
    const metadata = await sharp(await delivery.body()).metadata();
    expect(metadata.width).toBe(3840);
    expect(metadata.height).toBe(2160);
    expect(
      (await reader.request.get(`/media/${assetId}/original`)).status(),
    ).toBe(404);
    const cannotTrash = await api(`/api/admin/media/${assetId}`, "PATCH", {
      trash: true,
    });
    expect(cannotTrash.status).toBe(409);
    await page.goto("/admin/site");
    await audit();
    // Obtain the private draft through the normal owner session, not a privileged key.
    // The UI fields reproduce the canonical draft; this GET endpoint is admin-only.
    const current = await api("/api/admin/site", "GET");
    expect(current.status).toBe(200);
    originalConfig = current.body.config;
    await page
      .getByLabel("Main headline", { exact: true })
      .fill("A private preview headline.");
    await page
      .getByRole("button", { name: "Save website draft", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Private website draft saved",
    );
    await reader.goto("/");
    await expect(reader.getByRole("heading", { level: 1 })).not.toContainText(
      "A private preview headline",
    );
    await page.goto("/admin/site/preview");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "A private preview headline",
    );
    const latest = await api("/api/admin/site", "GET");
    const restored = await api("/api/admin/site", "POST", {
      config: readSite(originalConfig || defaultSite),
      version: latest.body.version,
      publish: false,
    });
    expect(restored.status).toBe(200);
    originalConfig = undefined;
    await page.goto(`/admin/posts/${postId}/edit`);
    await page.getByRole("button", { name: "Unpublish to draft" }).click();
    await expect(page.getByText("Draft saved privately.")).toBeVisible();
    expect(
      (await reader.request.get(`/media/${assetId}/master.webp`)).status(),
    ).toBe(404);
    await page.goto("/admin/media");
    await audit();
  } finally {
    // Remove only fixtures created by this test; never alter the owner's articles.
    if (originalConfig) {
      const latest = await api("/api/admin/site", "GET");
      await api("/api/admin/site", "POST", {
        config: readSite(originalConfig),
        version: latest.body.version,
        publish: false,
      });
    }
    if (postId)
      await client.from("posts").delete().eq("id", postId).eq("slug", slug);
    if (assetId)
      await api(`/api/admin/media/${assetId}`, "PATCH", { trash: true });
    if (process.env.JOURNAL_BACKUP_MEDIA === "1") {
      const report = await backupMedia({
        sessionFile: process.env.JOURNAL_TEST_STORAGE_STATE!,
      });
      expect((await verifyMediaBackup(report.directory)).verified).toBe(true);
    }
    await readerContext.close();
  }
}
