import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const BASE = "http://localhost:3000";

let supabaseAdmin: ReturnType<typeof createClient>;
const TEST_PASSWORD = "TestPass123!";
let freeEmail: string;
let subEmail: string;

test.describe("M9 — Billing page", () => {
  test.setTimeout(60000);

  test.beforeAll(async () => {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    freeEmail = `billing-free-${Date.now()}@test.com`;
    subEmail = `billing-sub-${Date.now()}@test.com`;

    // Create free user
    await supabaseAdmin.auth.admin.createUser({
      email: freeEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    // Create subscribed user (direct DB update simulates active subscription)
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: subEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (createError) throw new Error(`Failed to create user: ${createError.message}`);

    // Wait for trigger to create public.users row
    await new Promise((r) => setTimeout(r, 2000));

    // Update to simulate subscribed user
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        role: "subscribed",
        subscription_plan: "monthly",
        paddle_subscription_id: "sub_simulated_test",
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("email", subEmail);
    if (updateError) throw new Error(`Failed to update user: ${updateError.message}`);

    await new Promise((r) => setTimeout(r, 1000));
  });

  test("shows upgrade prompt for free plan user", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("load");
    await page.fill("#email", freeEmail);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto(`${BASE}/dashboard/billing`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    await expect(page.getByText("Current Plan")).toBeVisible();
    await expect(page.getByText("You are on the free plan")).toBeVisible();
    await expect(page.getByRole("button", { name: /upgrade now/i })).toBeVisible();
    await expect(page.getByText("Invoice History")).not.toBeVisible();
  });

  test("shows subscription details for subscribed user", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("load");
    await page.fill("#email", subEmail);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto(`${BASE}/dashboard/billing`);
    await page.waitForLoadState("load");

    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    await expect(page.getByText("Current Plan")).toBeVisible();
    await expect(page.getByText("Monthly")).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
    await expect(page.getByText("Renewal Date")).toBeVisible();
    await expect(page.getByText("Free Trial Used")).toBeVisible();

    await expect(page.getByText("Manage Subscription")).toBeVisible();
    await expect(page.getByRole("button", { name: /open customer portal/i })).toBeVisible();

    await expect(page.getByText("Invoice History")).toBeVisible();
  });

  test("shows canceled state for canceled subscription", async ({ page }) => {
    // Create a user with canceled subscription
    const cancelEmail = `billing-cancel-${Date.now()}@test.com`;
    await supabaseAdmin.auth.admin.createUser({
      email: cancelEmail,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    await new Promise((r) => setTimeout(r, 2000));

    await supabaseAdmin
      .from("users")
      .update({
        role: "canceled",
        subscription_plan: "yearly",
        paddle_subscription_id: "sub_canceled_test",
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("email", cancelEmail);
    await new Promise((r) => setTimeout(r, 1000));

    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("load");
    await page.fill("#email", cancelEmail);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto(`${BASE}/dashboard/billing`);
    await page.waitForLoadState("load");

    await expect(page.getByText("Subscription Canceled")).toBeVisible();
    await expect(page.getByText("Yearly")).toBeVisible();
    await expect(page.getByRole("button", { name: /resubscribe/i })).toBeVisible();
  });

  test("invoice history shows empty state for subscribed user", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("load");
    await page.fill("#email", subEmail);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto(`${BASE}/dashboard/billing`);
    await page.waitForLoadState("load");

    await expect(page.getByText("Invoice History")).toBeVisible();
    await expect(page.getByText("No invoices yet")).toBeVisible();
  });
});
