import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const route of [
  "/",
  "/blog",
  "/login",
  "/blog/not-a-real-article-accessibility-check",
]) {
  test(`accessibility: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    await testInfo.attach("accessibility-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeInViewport();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}

test("login is keyboard usable and reports invalid credentials accessibly", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("invalid-admin@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("NotARealAdministratorPassword-123");
  await page.getByRole("button", { name: "Sign in to studio" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("alert").filter({ hasText: "Unable to sign in" }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
