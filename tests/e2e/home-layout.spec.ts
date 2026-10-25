import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("navigation waits for hydration and opens on its first enabled activation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/static/**/*.js", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    const menu = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    });
    const search = page.getByRole("button", {
      name: "Search articles",
      exact: true,
    });
    await expect(menu).toBeDisabled({ timeout: 10000 });
    await expect(search).toBeDisabled();
    releaseScripts();
    await expect(menu).toBeEnabled();
    await menu.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await search.click();
    await expect(page.getByRole("dialog").getByRole("searchbox")).toBeFocused();
  } finally {
    releaseScripts();
  }
});

test("homepage cover retries its CDN when first-party encoding fails", async ({
  page,
}) => {
  await page.route("**/_next/image?**", (route) => route.abort());
  await page.goto("/");
  const image = page.locator(".magazine-hero-image img");
  await expect(image).toHaveAttribute(
    "src",
    /^https:\/\/images\.unsplash\.com\//,
  );
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const cover = element as HTMLImageElement;
        return cover.complete && cover.naturalWidth > 0;
      }),
    )
    .toBe(true);
});

test("hero controls remain accessible when cover photographs fail", async ({
  page,
}) => {
  await page.route("https://images.unsplash.com/**", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.locator(".magazine-hero-thumbnails .category-art"),
  ).toHaveCount(4);
  const results = await new AxeBuilder({ page })
    .include(".magazine-hero-thumbnails")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("homepage stories and reading-room link work without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    expect((await page.goto("/"))?.status()).toBe(200);
    await expect(page.locator(".magazine-hero h1 a")).toBeVisible();
    await expect(page.locator(".magazine-brand-banner h2")).toBeVisible();
    await page
      .getByRole("link", { name: "Enter the reading room", exact: true })
      .click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("deferred homepage sections remain readable when scrolling, focusing and printing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sections = page.locator(
    ".magazine-news-columns > section, .magazine-brand-banner, .magazine-desk",
  );
  expect(await sections.count()).toBeGreaterThan(5);
  for (const section of await sections.all()) {
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeInViewport();
    await expect(section.getByRole("heading").first()).toBeVisible();
    expect(
      await section.evaluate((element) => element.scrollHeight),
    ).toBeGreaterThan(0);
  }
  const deskLink = page.locator(".magazine-desk-copy h3 a").first();
  await page.evaluate(() => window.scrollTo(0, 0));
  await deskLink.focus();
  await expect(deskLink).toBeFocused();
  await expect(deskLink).toBeInViewport();
  await page.emulateMedia({ media: "print" });
  for (const section of await sections.all()) {
    await expect(section).toHaveCSS("content-visibility", "visible");
  }
  await page.emulateMedia({ media: "screen" });
  await deskLink.press("Enter");
  await expect(page).toHaveURL(/\/blog\/[^/?]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("reference-style masthead, hero selector and desktop news columns work with real stories", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".magazine-home")).toBeVisible();
  await expect(page.locator(".magazine-hero")).toBeVisible();
  const priorityCover = page.locator(".magazine-hero-image img[data-nimg]");
  if (await priorityCover.count()) {
    const source = new URL(
      (await priorityCover.getAttribute("src"))!,
      page.url(),
    );
    expect(source.origin).toBe(new URL(page.url()).origin);
    expect(source.pathname).toBe("/_next/image");
    await expect
      .poll(() =>
        priorityCover.evaluate((element) => {
          const image = element as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }
  await page.screenshot({
    path: testInfo.outputPath("journal-home-desktop-hero.png"),
  });
  const buttons = page.locator(".magazine-hero-thumbnails button");
  await expect(buttons).toHaveCount(4);
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  const nextTitle = (await buttons.nth(1).getAttribute("aria-label"))!.replace(
    "Show featured story: ",
    "",
  );
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".magazine-hero h1")).toContainText(nextTitle);
  await buttons.nth(1).press("ArrowRight");
  await expect(buttons.nth(2)).toBeFocused();
  await expect(buttons.nth(2)).toHaveAttribute("aria-pressed", "true");
  await buttons.nth(2).press("Home");
  await expect(buttons.first()).toBeFocused();
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  const columns = await page
    .locator(".magazine-news-columns > section")
    .evaluateAll((items) =>
      items.map((item) => ({
        x: item.getBoundingClientRect().x,
        y: item.querySelector("h2")!.getBoundingClientRect().y,
      })),
    );
  expect(columns).toHaveLength(3);
  expect(columns[0].x).toBeLessThan(columns[1].x);
  expect(columns[1].x).toBeLessThan(columns[2].x);
  expect(Math.abs(columns[0].y - columns[2].y)).toBeLessThan(3);
  await expect(page.locator(".magazine-desk")).toHaveCount(4);
  await expect(page.locator(".magazine-archive-cards > article")).toHaveCount(
    4,
  );
  await expect(
    page.getByRole("heading", { name: "Selected reads", exact: true }),
  ).toBeVisible();
  const subjectArt = page.locator(".magazine-subject-link").first();
  const subjectBounds = await subjectArt.evaluate((item) => ({
    artRight: item.querySelector(".category-art")!.getBoundingClientRect()
      .right,
    textLeft: item.querySelector(":scope > span")!.getBoundingClientRect().left,
  }));
  expect(subjectBounds.artRight).toBeLessThan(subjectBounds.textLeft);
  await page.screenshot({
    path: testInfo.outputPath("journal-home-desktop.png"),
    fullPage: true,
  });
});
test("mobile homepage keeps four compact thumbnail controls and stacks the story desks", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const stage = page.locator(".magazine-hero-stage");
  await expect(stage).toBeVisible();
  await expect(stage).toHaveCSS("height", "370px");
  await expect(
    page.locator(".magazine-thumbnail-title").first(),
  ).not.toBeVisible();
  const boxes = await page
    .locator(".magazine-hero-thumbnails button")
    .evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().y),
    );
  expect(new Set(boxes).size).toBe(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("journal-home-mobile.png"),
    fullPage: true,
  });
  await page.screenshot({
    path: testInfo.outputPath("journal-home-mobile-hero.png"),
  });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "Software Engineering", exact: true }),
  ).toBeVisible();
});
