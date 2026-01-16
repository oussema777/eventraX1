const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    env[k] = v;
  }
  return env;
}

const repoRoot = path.resolve(__dirname, "..");
const e2eEnv = loadEnvFile(path.join(repoRoot, ".env.e2e"));

const E2E_EMAIL = process.env.E2E_EMAIL || e2eEnv.E2E_EMAIL || "";
const E2E_PASSWORD = process.env.E2E_PASSWORD || e2eEnv.E2E_PASSWORD || "";

test("signup shows check-email message", async ({ page }) => {
  // Adjust these routes if your app uses different paths; Codex will fix selectors/routes during scan.
  await page.goto("/register");

  // Step 1: Click "Continue with Email" in the entry modal
  await page.getByRole("button", { name: /continue with email/i }).click();

  // Step 2: Fill the registration form
  const email = `e2e_${Date.now()}@gmail.com`;
  const modal = page.locator('div[role="dialog"], .relative.pointer-events-auto');
  await modal.getByLabel(/email address/i).fill(email);
  await modal.getByLabel(/password/i).fill("Password123");
  
  // Check terms checkbox - using force because of custom styling
  await modal.getByRole("checkbox").check({ force: true });

  // Ensure button is enabled
  const submitBtn = modal.getByRole("button", { name: /create account/i });
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // Wait for loader to appear and disappear (optional but good for stability)
  // await expect(page.getByText(/creating/i)).toBeVisible();
  // await expect(page.getByText(/creating/i)).not.toBeVisible();

  // Wait for either the success message or the profile setup modal
  await expect(page.locator('text=/check your email|complete your profile/i')).toBeVisible({ timeout: 20000 });
});

test("login works (requires E2E_EMAIL/E2E_PASSWORD)", async ({ page }) => {
  expect(E2E_EMAIL).toBeTruthy();
  expect(E2E_PASSWORD).toBeTruthy();

  await page.goto("/login");

  const modal = page.locator('div[role="dialog"], .relative.pointer-events-auto');
  await modal.getByLabel(/email address/i).fill(E2E_EMAIL);
  await modal.getByLabel(/password/i).fill(E2E_PASSWORD);

  // Target the login button within the form to avoid navigation conflict
  await modal.getByRole("button", { name: /^login$/i }).click();

  // Update to a stable post-login assertion in your UI (dashboard/account menu).
  await expect(page.getByText(/dashboard|my events|account/i)).toBeVisible({ timeout: 15000 });
});
