import { test, expect } from "@playwright/test";
test("reference-style masthead, hero selector and desktop news columns work with real stories", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".magazine-home")).toBeVisible();
  await expect(page.locator(".magazine-hero")).toBeVisible();
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
  const stage = await page.locator(".magazine-hero-stage").boundingBox();
  expect(stage!.height).toBe(370);
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
