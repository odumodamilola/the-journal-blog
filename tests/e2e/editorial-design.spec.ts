import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
for (const route of [
  "/",
  "/blog",
  "/blog?category=Technology",
  "/blog?category=Career",
  "/about",
  "/contact",
  "/login",
  "/blog/massive-global-cyber-security-flaw",
  "/not-a-real-page-editorial-check",
]) {
  test(`editorial responsive and accessible: ${route}`, async ({ page }) => {
    test.setTimeout(180000);
    const response = await page.goto(route);
    expect(response?.status()).toBe(
      route.startsWith("/not-a-real") ? 404 : 200,
    );
    // An error boundary also contains one heading; never count it as page coverage.
    await expect(
      page.getByRole("button", { name: "Try again ↻", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route}: ${width}px`,
      ).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.setViewportSize({ width: 1440, height: 1000 });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
test("mobile navigation and search dialogs restore focus and submit real searches", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await menu.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(menu).toBeFocused();
  await page
    .getByRole("button", { name: "Search articles", exact: true })
    .click();
  await page.getByRole("dialog").getByLabel("Search the journal").fill("cyber");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page).toHaveURL(/\/blog\?q=cyber$/);
  await expect(
    page.getByRole("link", {
      name: "Massive Global Cyber-Security Flaw",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
test("reduced motion keeps server-rendered editorial content visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page
    .getByRole("link", { name: "Explore the archive", exact: true })
    .first()
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", { name: "From the archive", exact: true }),
  ).toBeVisible();
});
test("contact errors are accessible and never pretend a failed save succeeded", async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send a note" }).click();
  await expect(page.getByLabel("Full name", { exact: true })).toBeFocused();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  const response = await request.post("/api/contact", {
    headers: { Origin: new URL(baseURL!).origin },
    data: {
      full_name: "A Reader",
      email: "bad",
      subject: "Question",
      message: "short",
    },
  });
  expect(response.status()).toBe(400);
  expect(
    (
      await request.post("/api/contact", {
        headers: { Origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
});
