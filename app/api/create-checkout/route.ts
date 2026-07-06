import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: true, message: "Missing priceId" });
    }

    const apiKey = process.env.PADDLE_API_KEY;
    const isProd = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production";
    const base = isProd ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";

    const txnRes = await fetch(`${base}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
      }),
    });

    const data = await txnRes.json();

    if (!txnRes.ok) {
      return NextResponse.json({ error: true, message: data.error?.detail || data.detail || JSON.stringify(data), detail: data });
    }

    const url = data.data?.checkout_url;
    if (!url) {
      return NextResponse.json({ error: true, message: "No checkout_url in response", detail: data });
    }

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: true, message: err instanceof Error ? err.message : String(err) });
  }
}
