import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("M4 — Analysis Input & API", () => {
  test("New analysis page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/project/new`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Login page renders with all form elements", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("Signup page renders with all form elements", async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: "load" });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("Project result page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/project/some-id`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Subscribe page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/subscribe`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("All middleware-protected routes redirect to login", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/dashboard/project/new",
      "/dashboard/project/abc-123",
      "/dashboard/subscribe",
      "/dashboard/billing",
    ];

    for (const route of routes) {
      await page.goto(`${BASE}${route}`, { waitUntil: "load" });
      await page.waitForURL("**/login");
      await expect(page.locator("h1")).toHaveText("Welcome back");
    }
  });
});
