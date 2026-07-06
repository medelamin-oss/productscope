import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("M3 — Dashboard & Navigation", () => {
  test("Unauthenticated user redirected from /dashboard to /login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Unauthenticated user redirected from /dashboard/subscribe to /login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/subscribe`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Landing page has hero, features, how-it-works, and pricing", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(BASE, { waitUntil: "load" });
    expect(errors).toEqual([]);
    expect(await page.title()).toContain("ProductScope");

    // Hero
    await expect(page.getByText("Turn any product into a marketing powerhouse")).toBeVisible();
    await expect(page.getByRole("link", { name: /analyze your first product/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();

    // Features
    await expect(page.getByText("Instant Analysis")).toBeVisible();
    await expect(page.getByText("Marketing Content")).toBeVisible();
    await expect(page.getByText("Competitive Edge")).toBeVisible();

    // How It Works
    await expect(page.getByText("Three clicks to better marketing")).toBeVisible();

    // Pricing
    await expect(page.getByText("Start with a free analysis")).toBeVisible();
    await expect(page.getByText("$9")).toBeVisible();
    await expect(page.getByText("$69")).toBeVisible();

    // Nav + Footer
    await expect(page.getByRole("link", { name: /get started/i }).first()).toBeVisible();
    await expect(page.getByText("ProductScope").first()).toBeVisible();
  });

  test("Auth pages use correct design tokens", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });

    const h1Font = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1Font.toLowerCase()).toContain("jakarta");

    const button = page.getByRole("button", { name: /sign in/i });
    const btnBg = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(btnBg).toBe("rgb(26, 86, 219)"); // #1A56DB

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe("rgb(248, 250, 252)"); // #F8FAFC
  });

  test("Signup page has password validation", async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: "load" });

    await page.locator('input[type="email"]').fill("test@example.com");
    await page.locator('input[type="password"]').fill("123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.locator("h1")).toHaveText("Create account");
  });

  test("Auth form elements are accessible", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    await page.goto(`${BASE}/signup`, { waitUntil: "load" });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });
});
