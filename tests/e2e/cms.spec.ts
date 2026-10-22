import { test, expect } from "@playwright/test";
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
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ideas worth sharing",
  );
  await page
    .getByRole("main")
    .getByRole("link", { name: "Explore the archive" })
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
});

test("every admin route rejects anonymous visitors", async ({ page }) => {
  for (const route of [
    "/admin",
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

test("real administrator can save, preview, publish, edit, unpublish and delete", async ({
  page,
  browser,
}) => {
  test.skip(
    !credentials,
    "Set JOURNAL_TEST_EMAIL and JOURNAL_TEST_PASSWORD for a verified administrator to run the full CMS acceptance test.",
  );
  const slug = `cms-acceptance-${Date.now()}`;
  await page.goto("/login");
  await page.getByLabel("Email address").fill(credentials!.email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(credentials!.password);
  await page.getByRole("button", { name: "Sign in to studio" }).click();
  await expect(page).toHaveURL(/\/admin(\/account\?initial=1)?$/);
  await page.goto("/admin");
  await page.getByRole("link", { name: "+ New article" }).click();
  await page.getByLabel("Title", { exact: true }).fill("CMS acceptance story");
  await page.getByLabel("Article URL").fill(slug);
  await page
    .getByRole("button", { name: "Publish article", exact: true })
    .click();
  await expect(
    page.getByText("Article content is required to publish."),
  ).toBeVisible();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "CMS acceptance story",
  );
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
