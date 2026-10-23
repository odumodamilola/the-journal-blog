import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { editorialAcceptance } from "./editorial-flow";
const credentials =
  process.env.JOURNAL_TEST_EMAIL && process.env.JOURNAL_TEST_PASSWORD
    ? {
        email: process.env.JOURNAL_TEST_EMAIL,
        password: process.env.JOURNAL_TEST_PASSWORD,
      }
    : undefined;

test("public navigation, filtering, SEO and mobile layout", async ({
  page,
  request,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("link", { name: "Enter the reading room" })
    .click();
  await page.getByLabel("Search articles").fill("nonexistent-test-keyword");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("Technology");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("No stories match these filters.")).toBeVisible();
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /admin",
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
});

test("every admin route rejects anonymous visitors", async ({ page }) => {
  for (const route of [
    "/admin",
    "/admin/account",
    "/admin/media",
    "/admin/site",
    "/admin/site/preview",
    "/admin/posts/new",
    "/admin/posts/00000000-0000-4000-8000-00000000b001/edit",
    "/admin/posts/00000000-0000-4000-8000-00000000b001/preview",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Sign in to studio" }),
    ).toBeVisible();
  }
});
test("CMS APIs reject anonymous and cross-origin requests", async ({
  request,
  baseURL,
}) => {
  for (const path of ["/api/admin/media", "/api/admin/site"])
    expect((await request.get(path)).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin/site", {
        headers: { Origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/admin/media", {
        headers: { Origin: new URL(baseURL!).origin },
        data: {},
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.get(
        "/media/00000000-0000-4000-8000-00000000e001/master.webp",
      )
    ).status(),
  ).toBe(404);
});

test(
  "rich text, private 4K uploads, media protection and website drafts",
  editorialAcceptance,
);

test("real administrator can save, preview, publish, edit, unpublish and delete", async ({
  page,
  browser,
}) => {
  test.skip(
    !credentials && !process.env.JOURNAL_TEST_STORAGE_STATE,
    "Set JOURNAL_TEST_EMAIL and JOURNAL_TEST_PASSWORD for a verified administrator to run the full CMS acceptance test.",
  );
  const slug = `cms-acceptance-${Date.now()}`;
  if (process.env.JOURNAL_TEST_STORAGE_STATE) {
    const storage = JSON.parse(
      await readFile(process.env.JOURNAL_TEST_STORAGE_STATE, "utf8"),
    );
    await page.context().addCookies(storage.cookies);
  } else {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(credentials!.email);
    await page
      .getByLabel("Password", { exact: true })
      .fill(credentials!.password);
    await page.getByRole("button", { name: "Sign in to studio" }).click();
    await expect(page).toHaveURL(/\/admin(\/account\?initial=1)?$/);
  }
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  await page.goto("/admin/account");
  await audit();
  await page.goto("/admin");
  await audit();
  await page.getByRole("link", { name: "+ New article" }).click();
  await audit();
  await page.getByLabel("Title", { exact: true }).fill("CMS acceptance story");
  await page.getByRole("button", { name: "Use Markdown", exact: true }).click();
  await page.getByLabel("Article URL").fill(slug);
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("Tutorials");
  await expect(
    page.getByRole("combobox", { name: "Category", exact: true }),
  ).toHaveValue("Tutorials");
  await page
    .getByLabel("Short description")
    .fill("Acceptance coverage for cover images, categories, search, and SEO.");
  await page.getByText("Cover image (optional)", { exact: true }).click();
  const coverUrl = "https://picsum.photos/seed/journal-cms-acceptance/1200/800";
  await page.getByLabel("HTTPS image URL").fill(coverUrl);
  await page
    .getByLabel("Image description")
    .fill("Acceptance test landscape cover");
  await page
    .getByRole("button", { name: "Publish article", exact: true })
    .click();
  await expect(
    page.getByText("Article content is required to publish."),
  ).toBeVisible();
  await audit();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "CMS acceptance story",
  );
  await expect(page.getByLabel("Short description")).toHaveValue(
    "Acceptance coverage for cover images, categories, search, and SEO.",
  );
  await expect(
    page.getByRole("combobox", { name: "Category", exact: true }),
  ).toHaveValue("Tutorials");
  await page
    .getByLabel("Article content", { exact: true })
    .fill(
      "# A tested publishing workflow\n\nPrivate writing, ready for review.",
    );
  await page.getByRole("button", { name: "Preview Markdown" }).click();
  await expect(
    page.getByRole("heading", { name: "A tested publishing workflow" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved privately.")).toBeVisible();
  const publicContext = await browser.newContext();
  const reader = await publicContext.newPage();
  expect((await reader.goto(`/blog/${slug}`))?.status()).toBe(404);
  const row = page.getByRole("row").filter({ hasText: "CMS acceptance story" });
  await row.getByRole("link", { name: "Preview", exact: true }).click();
  await expect(
    page.getByText("Private preview", { exact: false }),
  ).toBeVisible();
  await audit();
  await page.getByRole("link", { name: "Back to editor" }).click();
  await page
    .getByRole("button", { name: "Publish article", exact: true })
    .click();
  await expect(
    page.getByText("Article published. It is now available to readers."),
  ).toBeVisible();
  await reader.goto(`/blog/${slug}`);
  await expect(
    reader.getByRole("heading", { name: "CMS acceptance story", exact: true }),
  ).toBeVisible();
  await expect(reader).toHaveTitle("CMS acceptance story · The Journal");
  expect(
    (
      await new AxeBuilder({ page: reader })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await expect(reader.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new RegExp(`/blog/${slug}$`),
  );
  await expect(
    reader.locator('meta[property="og:image"]').first(),
  ).toHaveAttribute("content", coverUrl);
  const image = reader.getByRole("img", {
    name: "Acceptance test landscape cover",
    exact: true,
  });
  await expect
    .poll(
      () =>
        image.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      { timeout: 30000 },
    )
    .toBe(true);
  await reader.goto("/blog?q=CMS%20acceptance&category=Tutorials");
  await expect(
    reader.getByRole("link", { name: "CMS acceptance story", exact: true }),
  ).toBeVisible();
  await reader.goto(`/blog/${slug}`);
  await page
    .getByRole("row")
    .filter({ hasText: "CMS acceptance story" })
    .getByRole("link", { name: "Edit", exact: true })
    .click();
  await expect(page.getByLabel("Article URL")).toHaveAttribute("readonly");
  await page
    .getByLabel("Title", { exact: true })
    .fill("Updated CMS acceptance story");
  await page.getByRole("button", { name: "Update published article" }).click();
  await expect(
    page.getByText("Article published. It is now available to readers."),
  ).toBeVisible();
  await reader.reload();
  await expect(
    reader.getByRole("heading", {
      name: "Updated CMS acceptance story",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("row")
    .filter({ hasText: "Updated CMS acceptance story" })
    .getByRole("link", { name: "Edit", exact: true })
    .click();
  await page.getByRole("button", { name: "Unpublish to draft" }).click();
  await expect(page.getByText("Draft saved privately.")).toBeVisible();
  expect((await reader.reload())?.status()).toBe(404);
  await page
    .getByRole("button", { name: "Delete Updated CMS acceptance story" })
    .click();
  await audit();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("link", {
      name: "Updated CMS acceptance story",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Updated CMS acceptance story" })
    .click();
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(
    page.getByText("Article deleted.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await publicContext.close();
});
