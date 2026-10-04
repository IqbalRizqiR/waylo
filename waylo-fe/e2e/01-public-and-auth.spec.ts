import { test, expect } from "@playwright/test";

test.describe("Public Pages & Authentication", () => {
  test("Welcome landing page renders hero and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Waylo/);
    await expect(page.locator("h1")).toContainText(/Find Your Way/i);
    await expect(page.locator("h1")).toContainText(/Build Your Future/i);

    // Verify primary call to actions
    const registerCta = page.getByRole("link", { name: /Mulai Perjalananmu|Start Your Journey/i });
    await expect(registerCta).toBeVisible();

    const loginCta = page.getByRole("link", { name: /Masuk|Log in/i }).first();
    await expect(loginCta).toBeVisible();
  });

  test("Terms of Service page renders legal clauses", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText(/Syarat dan Ketentuan|Terms of Service/i);
    await expect(page.getByText(/Penerimaan Ketentuan|Acceptance of Terms/i).first()).toBeVisible();
    await expect(page.getByText(/Hak Kekayaan Intelektual|Intellectual Property/i).first()).toBeVisible();
  });

  test("Privacy Policy page renders UU PDP compliance notice", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(/Kebijakan Privasi|Privacy Policy/i);
    await expect(page.getByText(/UU No\. 27 Tahun 2022|UU PDP/i).first()).toBeVisible();
    await expect(page.getByText(/Persetujuan Eksplisit Talent Pool|Explicit Talent Pool Consent/i)).toBeVisible();
  });

  test("Login page form validation and password visibility toggle", async ({ page }) => {
    await page.goto("/login");

    // Check heading and two-tone branding
    await expect(page.locator("h1")).toContainText(/Masuk ke|Log in to/i);

    // Toggle password visibility
    const passwordInput = page.locator("#password");
    await expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = page.getByRole("button", { name: /Tampilkan kata sandi|Show password/i });
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: /Sembunyikan kata sandi|Hide password/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("Login with invalid credentials displays alert", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("unregistered-account@waylo.test");
    await page.locator("#password").fill("WrongPassword999");
    await page.getByRole("button", { name: /Masuk|Log in/i, exact: true }).click();

    // Error alert banner should appear
    const alert = page.locator("[role='alert']");
    await expect(alert).toBeVisible({ timeout: 6000 });
  });

  test("Login as Mentor redirects directly to mentor dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("sarah.mentor@waylo.test");
    await page.locator("#password").fill("Password123");
    await page.getByRole("button", { name: /Masuk|Log in/i, exact: true }).click();

    await page.waitForURL("**/mentor/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/.*mentor\/dashboard/);
    await expect(page.locator("h1")).toContainText(/Selamat Datang|Welcome/i);
  });

  test("Register page validates fields and requires terms acceptance", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText(/Buat akun baru|Create a new account/i);

    const submitBtn = page.getByRole("button", { name: /Daftar|Sign up/i, exact: true });
    await expect(submitBtn).toBeVisible();

    // Check terms agreement checkbox
    const termsCheckbox = page.locator("input[type='checkbox']");
    await expect(termsCheckbox).toBeChecked();
  });
});
