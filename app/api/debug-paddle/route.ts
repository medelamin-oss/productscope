import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.PADDLE_API_KEY;
  const base = "https://sandbox-api.paddle.com";

  const results: Record<string, unknown> = {};

  // Check prices
  const priceRes = await fetch(`${base}/prices`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  results.prices = await priceRes.json();

  // Check products
  const prodRes = await fetch(`${base}/products`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  results.products = await prodRes.json();

  return NextResponse.json(results);
}
