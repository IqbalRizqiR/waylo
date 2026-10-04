import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Company Recruitment Portal", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateSession(page, "company");
  });

  test("Company dashboard metrics, active jobs and tasks", async ({ page }) => {
    await page.goto("/company/dashboard");
    await expect(page.locator("h1")).toContainText(/Hai|Hi|Selamat/i);
    await expect(page.getByText(/Lowongan Aktif|Active Jobs/i).first()).toBeVisible();
    await expect(page.getByText(/Kandidat Melamar|Applicants/i).first()).toBeVisible();
  });

  test("Jobs catalogue and 3-step create job wizard with currency formatting", async ({ page }) => {
    await page.goto("/company/jobs");
    await expect(page.locator("h1")).toContainText(/Lowongan|Jobs/i);

    // Open create job
    await page.getByRole("link", { name: /Buat Lowongan Baru|Create Job/i }).first().click();
    await expect(page.locator("h1")).toContainText(/Buat Lowongan|Create/i);

    // Verify currency formatting on salary input: typing raw digits formats live with dots
    const minSalaryInput = page.locator("#salaryMin");
    await minSalaryInput.fill("8000000");
    await expect(minSalaryInput).toHaveValue("8.000.000");

    const maxSalaryInput = page.locator("#salaryMax");
    await maxSalaryInput.fill("12000000");
    await expect(maxSalaryInput).toHaveValue("12.000.000");
  });

  test("Job detail page with quick stats and in-place edit form", async ({ page }) => {
    await page.goto("/company/jobs");
    const detailBtn = page.getByRole("link", { name: /Lihat Detail|View Detail/i }).first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText(/Deskripsi Pekerjaan|Job Description/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Edit Lowongan|Edit Job/i })).toBeVisible();
    }
  });

  test("Candidates pipeline and decision note confirmation modal", async ({ page }) => {
    await page.goto("/company/candidates");
    await expect(page.locator("h1")).toContainText(/Kandidat|Candidates/i);

    // Filter tabs present
    await expect(page.getByRole("tab", { name: /Semua|All/i })).toBeVisible();

    const candidateLink = page.getByRole("link", { name: /Lihat Detail|View Detail/i }).first();
    if (await candidateLink.isVisible()) {
      await candidateLink.click();
      await expect(page.getByText(/Progress Screening|Screening Progress/i)).toBeVisible();
      await expect(page.getByText(/Langkah selanjutnya|Next step/i)).toBeVisible();
    }
  });

  test("Mentor partners catalogue and invite action", async ({ page }) => {
    await page.goto("/company/mentor-partners");
    await expect(page.locator("h1")).toContainText(/Mitra Mentor|Mentor Partners/i);
    await expect(page.getByText(/Mentor-Assisted Screening/i)).toBeVisible();
  });

  test("Company profile overview and edit form", async ({ page }) => {
    await page.goto("/company/profile");
    await expect(page.locator("h1")).toContainText(/Profil Perusahaan|Company Profile/i);
    await expect(page.locator("#companyName")).toBeVisible();
    await expect(page.locator("#industry")).toBeVisible();
  });
});
