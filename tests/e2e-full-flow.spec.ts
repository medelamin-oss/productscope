import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3000";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_PASSWORD = "TestPass123!";
const TEST_PRODUCT_URL = "https://www.amazon.com/dp/B0CB7X8Y9Z";
let TEST_EMAIL: string;

test.describe("E2E — Full flow with real Supabase + OpenRouter", () => {
  test.setTimeout(300000); // 5 min — AI analysis takes ~50s

  test.beforeAll(async () => {
    TEST_EMAIL = `e2e-${Date.now()}@gmail.com`;
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    // Wait for trigger to create public.users row
    await new Promise((r) => setTimeout(r, 2000));
  });

  test("signup → analyze product → verify DB state and trial_used", async ({ page }) => {
    // ── 1. Log in via UI ──
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");

    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // ── 2. Verify user in DB ──
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", TEST_EMAIL)
      .single();
    expect(userError).toBeNull();
    expect(user).toBeTruthy();
    expect(user.trial_used).toBe(false);
    expect(user.role).toBe("free");

    // ── 3. Go to new analysis ──
    await page.goto(`${BASE}/dashboard/project/new`);
    await page.waitForLoadState("networkidle");

    // ── 4. Submit a product URL ──
    await page.fill("#url", TEST_PRODUCT_URL);
    await page.click('button[type="submit"]');

    // ── 5. Wait for redirect to results page ──
    await page.waitForURL(/\/dashboard\/project\//, { timeout: 30000 });

    // ── 6. Wait for analysis to complete (polling every 3s) ──
    await expect(
      page.getByText("Product Description")
    ).toBeVisible({ timeout: 180000 });

    // ── 7. Verify results page content ──
    await expect(page.getByText("Ad Headlines")).toBeVisible();
    await expect(page.getByText("Strengths")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Target Audience" })
    ).toBeVisible();

    // ── 8. Extract project ID from URL ──
    const url = page.url();
    const projectId = url.split("/").pop();

    // ── 9. Verify project in DB ──
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    expect(projectError).toBeNull();
    expect(project).toBeTruthy();

    // ── 10. Verify analysis result in DB ──
    const { data: result, error: resultError } = await supabaseAdmin
      .from("analysis_results")
      .select("*")
      .eq("project_id", projectId)
      .single();
    expect(resultError).toBeNull();
    expect(result).toBeTruthy();
    expect(result.status).toBe("completed");
    expect(result.product_description).toBeTruthy();
    expect(result.ad_headlines).toBeTruthy();
    expect(Array.isArray(result.ad_headlines)).toBe(true);
    expect(result.ad_headlines.length).toBeGreaterThanOrEqual(3);
    expect(result.target_audience).toBeTruthy();

    // ── 11. Verify trial_used flipped to true ──
    const { data: updatedUser } = await supabaseAdmin
      .from("users")
      .select("trial_used")
      .eq("email", TEST_EMAIL)
      .single();
    expect(updatedUser.trial_used).toBe(true);
  });

  test("user can log in with existing credentials", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");

    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
