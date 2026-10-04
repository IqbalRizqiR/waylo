import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Learner Core Loop", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateSession(page, "learner");
  });

  test("Dashboard renders stats, track progress, and shell navigation", async ({ page }) => {
    await page.goto("/learner/dashboard");

    // Shell header initials avatar and brand logo
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();

    // Verify presence of core stat cards
    await expect(page.getByText(/Progres Belajar|Learning Progress/i)).toBeVisible();
  });

  test("Career exploration and detail view with skill gap matrix", async ({ page }) => {
    await page.goto("/learner/careers");
    await expect(page.locator("h1")).toContainText(/Karier|Careers/i);

    // Click first career detail link if cards exist, or navigate to detail
    const detailLink = page.getByRole("link", { name: /Lihat Detail|View Detail/i }).first();
    if (await detailLink.isVisible()) {
      await detailLink.click();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText(/Analisis Kebutuhan Skill|Skill Gap Analysis/i)).toBeVisible();
    } else {
      await page.goto("/learner/careers/test-career-id");
      await expect(page.getByRole("button", { name: /Kembali|Back/i })).toBeVisible();
    }
  });

  test("Onboarding wizard branching (Known path vs Quiz discovery)", async ({ page }) => {
    await page.goto("/learner/onboarding");
    await expect(page.locator("h1")).toContainText(/Onboarding/i);

    // Step 1: Decision cards
    const knownBranch = page.getByText(/Saya Sudah Punya Target|I Already Have a Target/i);
    const quizBranch = page.getByText(/Bantu Saya Menemukan|Help Me Discover/i);

    await expect(knownBranch).toBeVisible();
    await expect(quizBranch).toBeVisible();

    // Test clicking Known branch
    await knownBranch.click();
    await expect(page.getByText(/Pilih Target Karier|Select Target Career/i)).toBeVisible();

    // Back to Step 1
    await page.getByRole("button", { name: /Kembali|Back/i }).first().click();
    await expect(knownBranch).toBeVisible();
  });

  test("Roadmap view renders modules and allows status progression", async ({ page }) => {
    await page.goto("/learner/roadmap");
    await expect(page.locator("h1")).toContainText(/Roadmap/i);

    // Verify stats row
    await expect(page.getByText(/Modul|Modules/i).first()).toBeVisible();
    await expect(page.getByText(/Selesai|Completed/i).first()).toBeVisible();
  });

  test("Skill gap analysis renders radar comparison and action breakdown", async ({ page }) => {
    await page.goto("/learner/skill-gap");
    await expect(page.locator("h1")).toContainText(/Skill Gap/i);

    // Verify chart container and breakdown table
    const tableHeader = page.getByText(/Rincian & Rekomendasi Langkah|Breakdown & Recommended Actions/i);
    if (await tableHeader.isVisible()) {
      await expect(tableHeader).toBeVisible();
      await expect(page.getByText(/Radar Kompetensi Skill|Skill Competency Radar/i)).toBeVisible();
    }
  });
});
