import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Learner Learning, Assessments & Mentors", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateSession(page, "learner");
  });

  test("Courses catalogue and lesson viewer with interactive H5P player", async ({ page }) => {
    await page.goto("/learner/courses");
    await expect(page.locator("h1")).toContainText(/Materi Pembelajaran|Learning Content/i);

    // Navigate to course detail
    const courseLink = page.getByRole("link", { name: /Lihat Kursus|Lanjutkan Belajar|View Course|Continue Learning/i }).first();
    if (await courseLink.isVisible()) {
      await courseLink.click();
      await expect(page.locator("h1")).toBeVisible();

      // Click first lesson
      const lessonLink = page.getByRole("link", { name: /Mulai|Pelajari Ulang|Start|Review/i }).first();
      if (await lessonLink.isVisible()) {
        await lessonLink.click();
        // H5P interactive player container
        await expect(page.getByText(/Slide 1/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /Lanjut|Next/i })).toBeVisible();

        // Advance slide
        await page.getByRole("button", { name: /Lanjut|Next/i }).click();
        await expect(page.getByText(/Slide 2/i)).toBeVisible();
      }
    }
  });

  test("Practical projects catalogue and submission form", async ({ page }) => {
    await page.goto("/learner/projects");
    await expect(page.locator("h1")).toContainText(/Proyek Praktik|Hands-on Projects/i);

    const projectLink = page.getByRole("link", { name: /Kerjakan Proyek|Lihat Pengumpulan|Start Project|View Submission/i }).first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText(/Instruksi & Kriteria|Project Instructions/i)).toBeVisible();

      // Form input elements
      await expect(page.locator("#repoUrl")).toBeVisible();
    }
  });

  test("Assessments list and interactive quiz taking interface", async ({ page }) => {
    await page.goto("/learner/assessments");
    await expect(page.locator("h1")).toContainText(/Asesmen|Assessments/i);

    // Click the last assessment ("Asesmen Skill Dasar" which has seeded questions)
    const startQuizLink = page.getByRole("link", { name: /Mulai Asesmen|Start Assessment/i }).last();
    if (await startQuizLink.isVisible()) {
      await Promise.all([
        page.waitForURL("**/learner/assessments/**"),
        startQuizLink.click(),
      ]);
      // Quiz UI: question prompt and next question button
      await expect(page.locator("h3")).toBeVisible({ timeout: 15000 });
      const nextBtn = page.getByRole("button", { name: /Soal Berikutnya|Kumpulkan Jawaban|Next Question|Submit Answers/i });
      await expect(nextBtn).toBeVisible();
    }
  });

  test("Mentors directory and calendar slot booking", async ({ page }) => {
    await page.goto("/learner/mentors");
    await expect(page.locator("h1")).toContainText(/Temukan Mentor|Find a Mentor/i);

    const mentorProfileLink = page.getByRole("link", { name: /Lihat Profil & Jadwal|View Profile & Schedule/i }).first();
    if (await mentorProfileLink.isVisible()) {
      await mentorProfileLink.click();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText(/Jadwalkan Sesi Mentoring|Schedule a Mentoring Session/i)).toBeVisible();
      await expect(page.getByText(/Pilih Hari|Select Day/i)).toBeVisible();
    }
  });

  test("Certificates directory and completion certificate view", async ({ page }) => {
    await page.goto("/learner/certificates");
    await expect(page.locator("h1")).toContainText(/Sertifikat|Certificates/i);

    const certLink = page.getByRole("link", { name: /Lihat Sertifikat|View Certificate/i }).first();
    if (await certLink.isVisible()) {
      await certLink.click();
      await expect(page.getByText(/Sertifikat Penyelesaian|Certificate of Completion/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Cetak Sertifikat|Print Certificate/i })).toBeVisible();
    }
  });
});
