import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("M5 — Results & PDF Export", () => {
  test("Unauthenticated user redirected from project page to login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/project/some-id`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Login page renders with brand design tokens", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });

    const btn = page.getByRole("button", { name: /sign in/i });
    await expect(btn).toBeVisible();

    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(26, 86, 219)");

    const font = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font.toLowerCase()).toContain("jakarta");
  });

  test("All protected routes redirect unauthenticated users", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/dashboard/project/new",
      "/dashboard/project/abc",
      "/dashboard/subscribe",
      "/dashboard/billing",
    ];
    for (const route of routes) {
      await page.goto(`${BASE}${route}`, { waitUntil: "load" });
      await page.waitForURL("**/login");
      await expect(page.locator("h1")).toHaveText("Welcome back");
    }
  });

  test("Landing page has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(BASE, { waitUntil: "load" });
    expect(errors).toEqual([]);
  });
});
