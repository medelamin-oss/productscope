import { test, expect } from "@playwright/test";

test.describe("Paddle checkout investigation", () => {
  test("capture API error from Paddle checkout page", async ({ page }) => {
    const requests: { method: string; url: string; body: string }[] = [];
    page.on("request", async (req) => {
      if (req.url().includes("checkout-service")) {
        let body = "";
        try { body = await req.postData() || ""; } catch {}
        requests.push({ method: req.method(), url: req.url(), body: body.substring(0, 1000) });
      }
    });

    const failures: string[] = [];
    page.on("requestfailed", (req) => {
      if (req.url().includes("checkout-service")) {
        failures.push(`${req.url()} FAILED: ${req.failure()?.errorText}`);
      }
    });

    const responses: { url: string; status: number; body: string }[] = [];
    page.on("response", async (res) => {
      if (res.url().includes("checkout-service")) {
        let body = "";
        try { body = await res.text(); } catch (e) { body = `[Error reading body: ${e}]`; }
        responses.push({ url: res.url(), status: res.status(), body: body.substring(0, 1000) });
      }
    });

    await page.goto("https://sandbox-buy.paddle.com/product/pro_01kwmfkjbrp4ppg4cgeswdba9e", {
      waitUntil: "load",
      timeout: 30000,
    });

    await page.waitForTimeout(5000);

    console.log("=== REQUESTS ===");
    requests.forEach((r) => console.log(r));

    console.log("\n=== CHECKOUT SERVICE RESPONSES ===");
    if (responses.length === 0) {
      console.log("NO RESPONSES CAPTURED FROM CHECKOUT SERVICE");
    }
    responses.forEach((r) => console.log(`${r.status} ${r.url}\n${r.body}\n`));

    console.log("\n=== FAILURES ===");
    if (failures.length === 0) {
      console.log("NO FAILURES");
    }
    failures.forEach((f) => console.log(f));

    const bodyText = await page.locator("body").innerText();
    console.log("\n=== PAGE TEXT ===");
    console.log(bodyText.substring(0, 500));
  });
});
