import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Admin Platform Governance", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateSession(page, "admin");
  });

  test("Admin dashboard metrics and control shortcuts", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("h1")).toContainText(/Pusat Kontrol|Control Center/i);
    await expect(page.getByText(/Total Learner/i)).toBeVisible();
    await expect(page.getByText(/Perusahaan Rekanan|Partner Companies/i)).toBeVisible();
  });

  test("User governance directory and role management", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.locator("h1")).toContainText(/Manajemen Pengguna|User Governance/i);
    await expect(page.getByText(/Peran Saat Ini|Current Role/i)).toBeVisible();
  });

  test("Skills taxonomy management and add skill modal", async ({ page }) => {
    await page.goto("/admin/skills");
    await expect(page.locator("h1")).toContainText(/Taksonomi Skill|Skills Taxonomy/i);

    // Toggle add skill form
    const addBtn = page.getByRole("button", { name: /Tambah Skill Baru|Add New Skill/i });
    await addBtn.click();
    await expect(page.locator("#skillName")).toBeVisible();
    await expect(page.locator("#skillSlug")).toBeVisible();
  });

  test("Careers pathway matrix and skill requirement calibration", async ({ page }) => {
    await page.goto("/admin/careers");
    await expect(page.locator("h1")).toContainText(/Matriks Jalur Karier|Career Pathways/i);

    const addCareerBtn = page.getByRole("button", { name: /Tambah Karier Baru|Add New Career/i });
    await addCareerBtn.click();
    await expect(page.locator("#careerTitle")).toBeVisible();
    await expect(page.getByText(/Pilih Skill Persyaratan|Select Required Skills/i)).toBeVisible();
  });

  test("Assessment question bank authoring supporting all 5 question types", async ({ page }) => {
    await page.goto("/admin/assessments");
    await expect(page.locator("h1")).toContainText(/Bank Soal|Question Bank/i);

    const addQuestionBtn = page.getByRole("button", { name: /Tambah Butir Soal|Add Question/i });
    await addQuestionBtn.click();
    await expect(page.locator("h2")).toContainText(/Formulir Butir Soal|New Question Item Form/i);
  });

  test("Admin can view platform courses catalogue and access H5P governance", async ({ page }) => {
    await page.goto("/admin/courses");
    await expect(page.locator("h1")).toContainText(/Tata Kelola Kursus|Platform Courses/i);
    await expect(page.getByText(/Interaktif H5P|H5P Interactive/i).first()).toBeVisible();
  });
});
