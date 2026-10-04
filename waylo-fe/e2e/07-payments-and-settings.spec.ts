import { test, expect } from "@playwright/test";
import { authenticateSession } from "./helpers/auth";

test.describe("Profiles, Settings & Subscriptions", () => {
  test("Learner profile displays verified skills and UU PDP talent pool consent", async ({ page }) => {
    await authenticateSession(page, "learner");
    await page.goto("/learner/profile");

    await expect(page.locator("h1")).toContainText(/Profil Saya|My Profile/i);
    await expect(page.getByText(/Kepatuhan UU PDP|UU PDP/i).first()).toBeVisible();
    await expect(page.getByText(/Izinkan Perusahaan Menemukan Profil Saya|Allow Companies to Discover My Profile/i)).toBeVisible();
  });

  test("Learner account settings password change form and notification preferences", async ({ page }) => {
    await authenticateSession(page, "learner");
    await page.goto("/learner/settings");

    await expect(page.locator("h1")).toContainText(/Pengaturan Akun|Account Settings/i);
    await expect(page.locator("#currentPassword")).toBeVisible();
    await expect(page.locator("#newPassword")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
  });

  test("Company account settings and security", async ({ page }) => {
    await authenticateSession(page, "company");
    await page.goto("/company/settings");

    await expect(page.locator("h1")).toContainText(/Pengaturan Akun|Account Settings/i);
    await expect(page.getByText(/Keamanan & Kata Sandi|Security & Password/i)).toBeVisible();
  });

  test("Learner subscription plans and Midtrans checkout button", async ({ page }) => {
    await authenticateSession(page, "learner");
    await page.goto("/learner/subscription");

    await expect(page.locator("h1")).toContainText(/Paket Langganan|Subscription Plans/i);
    const selectBtn = page.getByRole("button", { name: /Pilih Paket|Choose Plan/i }).first();
    await expect(selectBtn).toBeVisible();
  });

  test("Company recruitment subscription tiers and checkout", async ({ page }) => {
    await authenticateSession(page, "company");
    await page.goto("/company/subscription");

    await expect(page.locator("h1")).toContainText(/Pilih Paket Recruitment|Choose a Recruitment Plan/i);
    await expect(page.getByText(/Subscribe, Premium|Free\/Trial/i).first()).toBeVisible();
  });
});
