import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("M2 — Auth UI", () => {
  test("Login page renders with correct design", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`${BASE}/login`, { waitUntil: "load" });

    // No console errors
    expect(errors).toEqual([]);

    // Page title
    await expect(page.locator("h1")).toHaveText("Welcome back");

    // Form elements present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // Link to signup
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();

    // Font applied (Plus Jakarta Sans on h1)
    const h1Font = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1Font.toLowerCase()).toContain("jakarta");
  });

  test("Signup page renders with correct design", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`${BASE}/signup`, { waitUntil: "load" });

    expect(errors).toEqual([]);

    await expect(page.locator("h1")).toHaveText("Create account");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("Login form validates empty fields", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });
    await page.getByRole("button", { name: /sign in/i }).click();
    // Browser native validation should prevent submit
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Navigation between login and signup", async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });
    await page.getByRole("link", { name: /sign up/i }).click();
    await page.waitForURL("**/signup");
    await expect(page.locator("h1")).toHaveText("Create account");

    await page.getByRole("link", { name: /sign in/i }).click();
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });

  test("Unauthenticated user is redirected to login from dashboard", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "load" });
    await page.waitForURL("**/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });
});
