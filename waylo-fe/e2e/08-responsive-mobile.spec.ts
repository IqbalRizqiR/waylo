import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Mobile & Responsive Layouts (375px width)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("Login page has zero horizontal scroll on mobile", async ({ page }) => {
    await page.goto("/login");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test("Register page has zero horizontal scroll on mobile", async ({ page }) => {
    await page.goto("/register");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test("Learner dashboard reflows cleanly without horizontal overflow", async ({ page }) => {
    await authenticateSession(page, "learner");
    await page.goto("/learner/dashboard");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test("Company job creation wizard fits mobile viewport cleanly", async ({ page }) => {
    await authenticateSession(page, "company");
    await page.goto("/company/jobs/new");

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});
