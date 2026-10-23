import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import edition from "../../content/news/2026-10-23.json";

// Public, read-only acceptance coverage: never logs in or changes an article.
test("all 50 news briefs expose sources, timing, image credits and canonical URLs", async ({ request }) => {
  test.setTimeout(240000);
  for (let start = 0; start < edition.stories.length; start += 3) {
    await Promise.all(edition.stories.slice(start, start + 3).map(async (story) => {
      const slug = `news-${edition.edition}-${story.key}`;
      const response = await request.get(`/blog/${slug}`);
      expect(response.status(), slug).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<h1`);
      expect(html).toContain(`/blog/${slug}`);
      expect(html).toContain("Source and timing");
      expect(html).toContain("not a photograph of this reported event");
      expect(html).toContain("https://unsplash.com/license");
      expect(html).toContain(new URL(story.source).hostname);
      expect(html).toContain("images.unsplash.com");
    }));
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const story of edition.stories)
    expect(sitemap).toContain(`news-${edition.edition}-${story.key}`);
});

test("World News archive has six complete pages with no duplicated articles", async ({ page }) => {
  test.setTimeout(180000);
  const found = new Set<string>();
  for (let number = 1; number <= 6; number++) {
    await page.goto(`/blog?category=World%20News&page=${number}`);
    await expect(page.getByText("50 stories found", { exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Category", exact: true })).toHaveValue("World News");
    const links = page.locator("main article h2 a");
    await expect(links).toHaveCount(number === 6 ? 5 : 9);
    for (const href of await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")!))) {
      expect(found.has(href), href).toBe(false);
      found.add(href);
    }
  }
  expect(found.size).toBe(50);
});

test("news article image loads and the mobile article is accessible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/blog/news-${edition.edition}-tibet-earthquake`);
  const image = page.getByRole("img", { name: /Mountain scenery in Tibet/ });
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element) => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0;
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
});
