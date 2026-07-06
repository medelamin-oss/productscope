import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3000";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_PASSWORD = "TestPass123!";
let TEST_EMAIL: string;

test.describe("E2E — Subscribe flow redirects to Paddle checkout", () => {
  test.setTimeout(120000);

  test.beforeAll(async () => {
    TEST_EMAIL = `sub-e2e-${Date.now()}@test.com`;
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    await new Promise((r) => setTimeout(r, 2000));
  });

  test("navigate to subscribe and redirect to Paddle checkout", async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to subscribe
    await page.goto(`${BASE}/dashboard/subscribe`);
    await page.waitForLoadState("networkidle");

    // 3. Verify page renders
    await expect(page.getByText("Upgrade your plan")).toBeVisible();
    await expect(page.getByRole("button", { name: /subscribe monthly/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /yearly/i })).toBeVisible();

    // 4. Click subscribe
    await page.getByRole("button", { name: /subscribe/i }).click();

    // 5. Verify redirect to Paddle checkout URL
    await page.waitForURL(/sandbox-buy\.paddle\.com/, { timeout: 15000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain("priceId");
    expect(currentUrl).toContain("pri_");
    expect(currentUrl).toContain("display=overlay");
  });
});
