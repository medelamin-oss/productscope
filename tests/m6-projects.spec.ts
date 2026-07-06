import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3000";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_PASSWORD = "TestPass123!";
let TEST_EMAIL: string;
let PROJECT_ID: string;

test.describe("M6 — Project Management (Rename & Delete)", () => {
  test.setTimeout(60000);

  test.beforeAll(async () => {
    TEST_EMAIL = `m6-${Date.now()}@gmail.com`;

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (userError) throw new Error(`Failed to create user: ${userError.message}`);
    await new Promise((r) => setTimeout(r, 2000));

    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert({
        user_id: user!.id,
        product_url: "https://example.com/product",
        product_name: "Test Product",
        language: "en",
      })
      .select()
      .single();
    if (projectError) throw new Error(`Failed to create project: ${projectError.message}`);
    PROJECT_ID = project!.id;
  });

  test("API returns 401 when unauthenticated", async ({ page }) => {
    const res1 = await page.request.patch(`${BASE}/api/projects/${PROJECT_ID}`, {
      data: { product_name: "Hacked" },
    });
    expect(res1.status()).toBe(401);

    const res2 = await page.request.delete(`${BASE}/api/projects/${PROJECT_ID}`);
    expect(res2.status()).toBe(401);
  });

  test("API returns 401 for invalid data", async ({ page }) => {
    const res = await page.request.patch(`${BASE}/api/projects/${PROJECT_ID}`, {
      data: { product_name: "" },
    });
    expect(res.status()).toBe(401);
  });

  test("Rename project via UI", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto(`${BASE}/dashboard/project/${PROJECT_ID}`);
    await page.waitForLoadState("networkidle");

    await page.click('button[title="Rename"]');

    const input = page.locator('input[value="Test Product"]');
    await input.fill("Renamed Product");

    await page.click('button:has(svg.lucide-check)');

    await expect(page.locator("h1")).toHaveText("Renamed Product", { timeout: 10000 });

    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("product_name")
      .eq("id", PROJECT_ID)
      .single();
    expect(project?.product_name).toBe("Renamed Product");
  });

  test("Delete project via UI", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.fill("#email", TEST_EMAIL);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto(`${BASE}/dashboard/project/${PROJECT_ID}`);
    await page.waitForLoadState("networkidle");

    await page.click('button[title="Delete project"]');
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("id", PROJECT_ID)
      .maybeSingle();
    expect(project).toBeNull();
  });
});
