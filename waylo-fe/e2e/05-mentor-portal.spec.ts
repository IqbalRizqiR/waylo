import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Mentor Portal", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateSession(page, "mentor");
  });

  test("Mentor dashboard metrics and upcoming schedule", async ({ page }) => {
    await page.goto("/mentor/dashboard");
    await expect(page.locator("h1")).toContainText(/Selamat Datang|Welcome/i);
    await expect(page.getByText(/Sesi Mendatang|Upcoming Sessions/i)).toBeVisible();
    await expect(page.getByText(/Total Honorarium|Total Earnings/i)).toBeVisible();
  });

  test("Technical review queue and evaluation sheet", async ({ page }) => {
    await page.goto("/mentor/reviews");
    await expect(page.locator("h1")).toContainText(/Evaluasi|Review/i);
    await expect(page.getByText(/Daftar Antrean Masuk|Incoming Review Queue/i)).toBeVisible();
  });

  test("Course authoring studio and modular lesson builder", async ({ page }) => {
    await page.goto("/mentor/courses");
    await expect(page.locator("h1")).toContainText(/Manajemen Kursus|My Authored Courses/i);

    // Open create course
    await page.getByRole("link", { name: /Buat Kursus Baru|Create New Course/i }).first().click();
    await expect(page.locator("h1")).toContainText(/Buat Kursus|Create New Course/i);

    // Fill course info
    await page.locator("#courseTitle").fill("Pengenalan Vue 3 Komposisi API");
    await page.getByRole("button", { name: /Tambah Modul|Add Lesson/i }).click();

    // Verify second lesson appeared
    await expect(page.locator("input[value='Modul Pembelajaran 2']")).toBeVisible();

    // Verify H5P visual studio builder is visible on lesson
    await expect(page.getByText(/H5P Studio|Studio Visual|Visual Studio/i).first()).toBeVisible();
    await expect(page.getByText(/Slide 1|Konsep Utama|Learning Objectives/i).first()).toBeVisible();
  });

  test("Mentor can preview and edit an existing course with H5P attachments", async ({ page }) => {
    await page.goto("/mentor/courses");
    const previewBtn = page.getByRole("link", { name: /Pratinjau Kursus|Preview Course/i }).first();
    if (await previewBtn.isVisible()) {
      await previewBtn.click();

      // Must remain in mentor portal
      await page.waitForURL("**/mentor/courses/**");
      await expect(page).toHaveURL(/.*mentor\/courses\/.+/);

      // Verify mentor preview mode badge and Edit Course button
      await expect(page.getByText(/Mode Pratinjau Mentor|Mentor Preview Mode/i)).toBeVisible();
      const editBtn = page.getByRole("link", { name: /Edit Kursus|Edit Course/i }).first();
      await expect(editBtn).toBeVisible();

      // Click Edit Course
      await editBtn.click();
      await page.waitForURL("**/edit");
      await expect(page.locator("#courseTitle")).toBeVisible();

      // Verify H5P visual studio exists in edit form
      await expect(page.getByText(/H5P Studio|Studio Visual|Visual Studio/i).first()).toBeVisible();
    }
  });

  test("Mentor profile credentials and hourly rate settings", async ({ page }) => {
    await page.goto("/mentor/profile");
    await expect(page.locator("h1")).toContainText(/Profil Mentor|Mentor Profile/i);
    await expect(page.locator("#headline")).toBeVisible();
    await expect(page.locator("#hourlyRate")).toBeVisible();
  });
});
